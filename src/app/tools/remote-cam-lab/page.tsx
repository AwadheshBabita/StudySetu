"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RemoteCamContent() {
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role");
  const urlRoom = searchParams.get("room");

  const [role, setRole] = useState<"operator" | "client">("operator");
  const [roomId, setRoomId] = useState<string>("");
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<string>("तैयार...");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerInstance = useRef<any>(null);

  useEffect(() => {
    if (urlRole === "client" && urlRoom) {
      setRole("client");
      setRoomId(urlRoom);
      setConnectionStatus("कृपया नीचे बटन दबाकर कैमरा शुरू करें।");
    } else {
      setRole("operator");
      const generatedRoom = Math.floor(100000 + Math.random() * 900000).toString();
      setRoomId(generatedRoom);
      setupOperatorPeer(generatedRoom);
    }

    return () => {
      if (peerInstance.current) {
        peerInstance.current.destroy();
      }
    };
  }, [urlRole, urlRoom]);

  // ऑपरेटर (कंप्यूटर) सेटअप
  const setupOperatorPeer = async (room: string) => {
    const { default: Peer } = await import("peerjs");
    const peer = new Peer(`examsewa-${room}`);
    peerInstance.current = peer;

    peer.on("open", () => {
      setConnectionStatus("कस्टमर के जुड़ने का इंतज़ार है...");
    });

    peer.on("call", (call) => {
      setConnectionStatus("कस्टमर कनेक्ट हो रहा है...");
      call.answer();

      call.on("stream", (remoteStream) => {
        setConnectionStatus("सफलतापूर्वक कनेक्टेड (Live Streaming)");
        setIsStreaming(true);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
    });

    peer.on("error", (err: any) => {
      console.error(err);
      setConnectionStatus("एरर: " + err.type);
    });
  };

  // WhatsApp लिंक भेजना
  const sendWhatsAppLink = () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      alert("कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।");
      return;
    }
    const cleanNumber = mobileNumber.replace(/\D/g, "").slice(-10);
    const clientUrl = `https://examsewa.online/tools/remote-cam-lab?role=client&room=${roomId}`;
    const message = encodeURIComponent(
      `नमस्ते! परीक्षा फॉर्म के लिए आपका लाइव कैमरा लिंक:\n${clientUrl}\n\nलिंक खोलकर कैमरा Allow करें।`
    );
    window.open(`https://api.whatsapp.com/send?phone=91${cleanNumber}&text=${message}`, "_blank");
  };

  // कस्टमर (मोबाइल) कैमरा चालू करना
  const startClientStream = async () => {
    try {
      setConnectionStatus("कैमरा लोड हो रहा है...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setConnectionStatus("कंप्यूटर से जोड़ा जा रहा है...");
      const { default: Peer } = await import("peerjs");
      const peer = new Peer();
      peerInstance.current = peer;

      peer.on("open", () => {
        const call = peer.call(`examsewa-${roomId}`, stream);
        setIsStreaming(true);
        setConnectionStatus("लाइव कनेक्टेड! चेहरे को सीधे रखें।");

        call.on("close", () => {
          setConnectionStatus("कनेक्शन कट गया।");
          setIsStreaming(false);
        });
      });

      peer.on("error", (err: any) => {
        setConnectionStatus("कनेक्शन एरर: " + err.type);
      });
    } catch (err: any) {
      alert("कैमरा अनुमति नहीं मिली: " + err.message);
      setConnectionStatus("कैमरा परमिशन नहीं मिली।");
    }
  };

  // ==================== 1. कस्टमर व्यू (फुल स्क्रीन मोबाइल कैमरा) ====================
  if (role === "client") {
    return (
      <div className="fixed inset-0 z-[999999] bg-black text-white flex flex-col justify-between p-4 select-none">
        <div className="text-center pt-2">
          <h1 className="text-lg font-black text-emerald-400 tracking-wide">लाइव फोटो वेरिफिकेशन</h1>
          <p className="text-xs text-slate-300 mt-1">अपने चेहरे को बीच वाले अंडाकार (Oval) फ्रेम में रखें</p>
        </div>

        <div className="relative flex-1 w-full max-w-sm mx-auto my-3 bg-zinc-950 rounded-3xl overflow-hidden border-2 border-zinc-800 flex items-center justify-center">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-72 border-2 border-dashed border-emerald-400/80 rounded-[50%]" />
          </div>
          {!isStreaming && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-4xl mb-3">📷</span>
              <p className="text-sm font-semibold text-slate-200">कैमरा शुरू करने के लिए नीचे दिए गए बटन को दबाएँ</p>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm mx-auto space-y-2 pb-2">
          <div className="text-xs font-semibold text-center py-2 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-slate-300">
            {connectionStatus}
          </div>
          {!isStreaming && (
            <button
              onClick={startClientStream}
              className="w-full py-4 bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-500 text-white font-black text-base rounded-2xl shadow-xl transition"
            >
              📷 कैमरा चालू करें (Start Camera)
            </button>
          )}
          {isStreaming && (
            <div className="w-full py-3 bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 font-bold text-xs rounded-xl text-center animate-pulse">
              ● लाइव स्ट्रीम चालू है (कैमरे में सीधे देखें)
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== 2. ऑपरेटर व्यू (एक ही पेज पर ड्राइवर + लाइव कैमरा) ====================
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">
        
        {/* हैडर */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">ExamSewa Remote WebCam</h1>
            <p className="text-xs text-slate-500 mt-1">BPSC, CTET और सरकारी पोर्टल्स पर दूर बैठे कस्टमर की लाइव फोटो लें</p>
          </div>
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-mono font-bold">
            ROOM CODE: {roomId}
          </div>
        </div>

        {/* STEP 1: ड्राइवर डाउनलोड कार्ड (केवल पहली बार के लिए) */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-block bg-blue-500/30 text-blue-200 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
              Step 1: केवल पहली बार के लिए
            </div>
            <h2 className="text-lg font-bold">ExamSewa Virtual Camera Driver (Windows)</h2>
            <p className="text-xs text-blue-200 max-w-lg leading-relaxed">
              सरकारी वेबसाइट (BPSC) के कैमरा ड्रॉप-डाउन में <strong>'ExamSewa Virtual Camera'</strong> लाने के लिए अपने कंप्यूटर में इसे इंस्टॉल करें।
            </p>
          </div>
          <a
            href="/downloads/ExamSewa-VirtualCam-Setup.exe"
            download
            className="w-full md:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl transition shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <span>📥</span> Download Driver (Windows)
          </a>
        </div>

        {/* STEP 2: दैनिक लाइव कैमरा कनेक्ट */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="border-b pb-3">
            <div className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
              Step 2: दैनिक उपयोग
            </div>
            <h2 className="text-base font-bold text-slate-900">कस्टमर का मोबाइल कैमरा कनेक्ट करें</h2>
          </div>

          {/* नंबर और WhatsApp लिंक */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center">
            <span className="font-bold text-xs text-slate-700 whitespace-nowrap">कस्टमर मोबाइल:</span>
            <input
              type="tel"
              maxLength={10}
              placeholder="10 अंकों का नंबर (e.g. 9876543210)"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full sm:flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-emerald-600"
            />
            <button
              onClick={sendWhatsAppLink}
              className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              WhatsApp पर लिंक भेजें
            </button>
          </div>

          {/* लाइव वीडियो स्क्रीन */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span>स्थिति: <strong className="text-slate-900">{connectionStatus}</strong></span>
              {isStreaming && <span className="text-emerald-600 font-bold animate-pulse">● LIVE STREAMING</span>}
            </div>

            <div className="relative aspect-4/3 max-w-xl mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-200 flex items-center justify-center shadow-inner">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!isStreaming && (
                <div className="text-center text-slate-500 text-xs p-6 space-y-2">
                  <p className="font-medium text-slate-400">कस्टमर की लाइव वीडियो यहाँ दिखाई देगी।</p>
                  <p className="text-[11px] text-slate-600">WhatsApp लिंक भेजें और कस्टमर को खोलने को कहें।</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function RemoteCamLabPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">लोड हो रहा है...</div>}>
      <RemoteCamContent />
    </Suspense>
  );
}
