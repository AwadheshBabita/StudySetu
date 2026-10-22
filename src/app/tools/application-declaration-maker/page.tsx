"use client";

import React, { useState, useRef } from "react";

type Language = "hi" | "en";
type RelationType = "son" | "daughter" | "wife";
type FontSize = "small" | "medium" | "large";

interface LocalizedText {
  hi: string;
  en: string;
}

interface TemplateConfig {
  id: string;
  category: { hi: string; en: string };
  title: LocalizedText;
  recipientTitle: LocalizedText;
  recipientOrg: LocalizedText;
  recipientLocation: LocalizedText;
  defaultSubject: LocalizedText;
  defaultBody: LocalizedText;
  customFields?: {
    showOpponent?: boolean;
    showIncidentDate?: boolean;
    showAccountNo?: boolean;
    showRollNo?: boolean;
    showConsumerNo?: boolean;
    showRationNo?: boolean;
  };
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: "police-general",
    category: { hi: "पुलिस एवं सुरक्षा", en: "Police & Security" },
    title: { hi: "पुलिस सामान्य शिकायत", en: "Police Complaint (General)" },
    recipientTitle: { hi: "श्रीमान थाना प्रभारी महोदय", en: "The Station House Officer (SHO)" },
    recipientOrg: { hi: "थाना कोतवाली / संबंधित थाना", en: "Police Station Kotwali" },
    recipientLocation: { hi: "जनपद, उत्तर प्रदेश", en: "District, Uttar Pradesh" },
    defaultSubject: {
      hi: "उचित कानूनी कार्रवाई एवं निष्पक्ष जाँच हेतु प्रार्थना-पत्र",
      en: "Application for fair investigation and necessary legal action"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी के साथ घटित घटना के संबंध में यह प्रार्थना-पत्र प्रस्तुत है। घटना का विस्तृत एवं क्रमवार विवरण निम्नलिखित है:\n\n1. दिनांक को प्रार्थी अपने गंतव्य पर था तभी विपक्षीगण द्वारा अकारण विवाद उत्पन्न किया गया।\n2. प्रार्थी द्वारा विरोध करने पर अभद्रता एवं अनुचित भाषा का प्रयोग किया गया।\n3. घटना के प्रत्यक्षदर्शी स्थानीय नागरिक हैं जिन्होंने बीच-बचाव किया।\n\nअतः तथ्यों की पुष्टि कर नियमानुसार प्राथमिक स्तर पर जाँच कराने की कृपा करें।",
      en: "Most respectfully, I submit this complaint regarding an incident that took place against me. The sequence of events is as follows:\n\n1. On the said date, the opposite parties unnecessarily initiated an altercation while I was on my way.\n2. When I objected, abusive language and misbehavior were directed at me.\n3. Local residents witnessed the incident and intervened.\n\nTherefore, I kindly request you to verify the facts and initiate appropriate legal inquiry in accordance with the law."
    },
    customFields: { showOpponent: true, showIncidentDate: true },
  },
  {
    id: "police-theft",
    category: { hi: "पुलिस एवं सुरक्षा", en: "Police & Security" },
    title: { hi: "चोरी / गुमशुदगी सूचना", en: "Lost / Theft Intimation" },
    recipientTitle: { hi: "श्रीमान थाना प्रभारी महोदय", en: "The Station House Officer (SHO)" },
    recipientOrg: { hi: "संबंधित थाना", en: "Police Station" },
    recipientLocation: { hi: "जनपद, उत्तर प्रदेश", en: "District, Uttar Pradesh" },
    defaultSubject: {
      hi: "दस्तावेज / सामान गुम अथवा चोरी होने के संबंध में सूचना एवं प्रार्थना-पत्र",
      en: "Intimation regarding loss/theft of important documents/articles"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी का आवश्यक दस्तावेज/सामान यात्रा के दौरान अचानक खो गया है। काफी खोजबीन करने के उपरांत भी कोई सुराग नहीं मिल सका है। भविष्य में इसके दुरुपयोग की आशंका को देखते हुए यह सूचना दर्ज की जा रही है।",
      en: "With due respect, I wish to state that my valuable articles/documents were lost during transit. Despite best efforts, they could not be traced. This intimation is being submitted to prevent any potential misuse in the future."
    },
    customFields: { showOpponent: false, showIncidentDate: true },
  },
  {
    id: "police-threat",
    category: { hi: "पुलिस एवं सुरक्षा", en: "Police & Security" },
    title: { hi: "मारपीट / धमकी शिकायत", en: "Assault / Threat Complaint" },
    recipientTitle: { hi: "श्रीमान थाना प्रभारी महोदय", en: "The Station House Officer (SHO)" },
    recipientOrg: { hi: "संबंधित थाना", en: "Police Station" },
    recipientLocation: { hi: "जनपद, उत्तर प्रदेश", en: "District, Uttar Pradesh" },
    defaultSubject: {
      hi: "गाली-गलौज, मारपीट एवं जान से मारने की धमकी देने के संबंध में",
      en: "Complaint regarding physical assault, abusive behavior, and criminal intimidation"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि विपक्षी द्वारा प्रार्थी के साथ अकारण विवाद उत्पन्न कर गाली-गलौज एवं जान से मारने की धमकी दी गई है। प्रार्थी एवं उसके परिवार को जान-माल का गंभीर खतरा बना हुआ है। अतः विपक्षीगण के विरुद्ध उचित कानूनी निरोधात्मक कार्रवाई करने की कृपा करें।",
      en: "Respectfully, I bring to your notice that the opposite party engaged in unprovoked quarrel, abused me, and issued life threats. There is serious apprehension regarding the safety of my life and family. I request you to take prompt preventive legal action."
    },
    customFields: { showOpponent: true, showIncidentDate: true },
  },
  {
    id: "bank-passbook",
    category: { hi: "बैंक एवं वित्त", en: "Banking & Finance" },
    title: { hi: "खोई बैंक पासबुक जारी कराने हेतु", en: "Lost Bank Passbook Duplicate" },
    recipientTitle: { hi: "श्रीमान शाखा प्रबंधक महोदय", en: "The Branch Manager" },
    recipientOrg: { hi: "भारतीय स्टेट बैंक / संबंधित बैंक", en: "State Bank of India / Respected Bank" },
    recipientLocation: { hi: "स्थानीय शाखा", en: "Local Branch" },
    defaultSubject: {
      hi: "खाते की नई पासबुक (Duplicate Passbook) जारी कराने हेतु",
      en: "Application for issuance of duplicate bank passbook"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी का बचत खाता आपकी शाखा में संचालित है। यात्रा के दौरान प्रार्थी की मूल बैंक पासबुक कहीं गिरकर खो गई है। काफी तलाशने के बाद भी नहीं मिली। अतः आपसे विनम्र निवेदन है कि प्रार्थी के उक्त खाते की नई पासबुक जारी करने की कृपा करें।",
      en: "Respectfully, I state that I maintain a savings account in your branch. My original passbook was accidentally lost during transit and could not be traced. Therefore, I kindly request you to issue a duplicate passbook for my account."
    },
    customFields: { showAccountNo: true },
  },
  {
    id: "bank-atm",
    category: { hi: "बैंक एवं वित्त", en: "Banking & Finance" },
    title: { hi: "नया ATM / डेबिट कार्ड जारी कराने हेतु", en: "New ATM / Debit Card Request" },
    recipientTitle: { hi: "श्रीमान शाखा प्रबंधक महोदय", en: "The Branch Manager" },
    recipientOrg: { hi: "संबंधित बैंक", en: "Respected Bank" },
    recipientLocation: { hi: "स्थानीय शाखा", en: "Local Branch" },
    defaultSubject: {
      hi: "बचत खाते हेतु नया एटीएम (ATM/Debit Card) जारी कराने के संबंध में",
      en: "Application for issuance of new ATM / Debit Card"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी का उक्त बचत खाता आपकी शाखा में सुचारु रूप से संचालित है। प्रार्थी को ऑनलाइन लेन-देन एवं नकदी निकासी हेतु एक नए एटीएम कार्ड की सख्त आवश्यकता है। आवश्यक पहचान पत्र संलग्न हैं। अतः नया एटीएम कार्ड जारी करने की कृपा करें।",
      en: "With due respect, I submit that I hold a savings account in your branch. I require a new ATM/Debit card for cash withdrawals and digital payments. All necessary identity proofs are attached herewith."
    },
    customFields: { showAccountNo: true },
  },
  {
    id: "bank-mobile",
    category: { hi: "बैंक एवं वित्त", en: "Banking & Finance" },
    title: { hi: "बैंक मोबाइल लिंक / री-केवाईसी", en: "Bank Mobile Link / Re-KYC" },
    recipientTitle: { hi: "श्रीमान शाखा प्रबंधक महोदय", en: "The Branch Manager" },
    recipientOrg: { hi: "भारतीय स्टेट बैंक / संबंधित बैंक", en: "State Bank of India / Respected Bank" },
    recipientLocation: { hi: "स्थानीय शाखा", en: "Local Branch" },
    defaultSubject: {
      hi: "बचत खाते में नया मोबाइल नंबर लिंक एवं केवाईसी अपडेट कराने हेतु",
      en: "Application for linking new mobile number and Re-KYC update in Savings Account"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी का बचत खाता आपकी शाखा में सुचारु रूप से संचालित है। सुरक्षा एवं एसएमएस अलर्ट की सुविधा प्राप्त करने हेतु प्रार्थी अपने खाते से नया मोबाइल नंबर पंजीकृत कराना चाहता है। सभी वैध पहचान प्रपत्र संलग्न हैं।",
      en: "With due respect, I state that I maintain a savings bank account in your branch. For receiving transactional alerts and security updates, I request you to link my updated mobile number to the account. Necessary KYC documents are enclosed herewith."
    },
    customFields: { showAccountNo: true },
  },
  {
    id: "bank-unfreeze",
    category: { hi: "बैंक एवं वित्त", en: "Banking & Finance" },
    title: { hi: "अकाउंट अनफ्रीज / चालू कराने हेतु", en: "Account Reactivation / Unfreeze" },
    recipientTitle: { hi: "श्रीमान शाखा प्रबंधक महोदय", en: "The Branch Manager" },
    recipientOrg: { hi: "संबंधित बैंक", en: "Respected Bank" },
    recipientLocation: { hi: "स्थानीय शाखा", en: "Local Branch" },
    defaultSubject: {
      hi: "निष्क्रिय / होल्ड खाते को पुनः सक्रिय (Reactivate) कराने हेतु",
      en: "Request for reactivation of inoperative / dormant bank account"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी का उक्त खाता कुछ समय से लेन-देन के अभाव में निष्क्रिय हो गया है। प्रार्थी अब इस खाते का नियमित संचालन करना चाहता है। कृपया आवश्यक औपचारिकताएं पूर्ण कराकर खाते को पुनः चालू करने की कृपा करें।",
      en: "Respectfully, I state that my aforementioned account has become dormant due to lack of transactions. I now intend to operate it regularly. Kindly complete the required formalities and reactivate the account at the earliest."
    },
    customFields: { showAccountNo: true },
  },
  {
    id: "electricity-meter",
    category: { hi: "बिजली एवं जनसुविधा", en: "Electricity & Utilities" },
    title: { hi: "खराब / जला मीटर बदलवाने हेतु", en: "Defective Electricity Meter Replacement" },
    recipientTitle: { hi: "श्रीमान अधिशासी / सहायक अभियंता महोदय", en: "The Executive / Assistant Engineer" },
    recipientOrg: { hi: "विद्युत वितरण खंड (पावर कॉर्पोरेशन)", en: "Electricity Distribution Division" },
    recipientLocation: { hi: "संबंधित उपकेंद्र, जनपद", en: "Substation, District" },
    defaultSubject: {
      hi: "परिसर में स्थापित खराब / बंद विद्युत मीटर बदलवाने के संबंध में",
      en: "Application for replacement of defective / burnt electricity meter"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी के परिसर में लगा हुआ घरेलू विद्युत मीटर अचानक खराब/बंद हो गया है, जिससे सही रीडिंग प्रदर्शित नहीं हो रही है। प्रार्थी नियमित रूप से बिल भुगतान करता रहा है। अतः स्थल निरीक्षण कर मीटर बदलवाने की कृपा करें।",
      en: "Respectfully, I bring to your notice that the electricity meter installed at my premises has become defective/stopped working. I have been paying bills regularly. Kindly arrange for an inspection and replace the meter."
    },
    customFields: { showConsumerNo: true },
  },
  {
    id: "electricity-bill",
    category: { hi: "बिजली एवं जनसुविधा", en: "Electricity & Utilities" },
    title: { hi: "गलत / अत्यधिक बिल संशोधन हेतु", en: "Electricity Bill Correction" },
    recipientTitle: { hi: "श्रीमान उपखंड अधिकारी (SDO) महोदय", en: "The Sub-Divisional Officer (SDO)" },
    recipientOrg: { hi: "विद्युत वितरण उपखंड", en: "Electricity Distribution Sub-Division" },
    recipientLocation: { hi: "संबंधित उपकेंद्र, जनपद", en: "Substation, District" },
    defaultSubject: {
      hi: "अत्यधिक / गलत विद्युत बिल में आवश्यक संशोधन कराने हेतु",
      en: "Application for correction of inflated electricity bill"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी को इस माह अत्यधिक एवं त्रुटिपूर्ण बिल प्राप्त हुआ है, जो वास्तविक विद्युत उपभोग से कहीं अधिक है। मीटर की वास्तविक रीडिंग के आधार पर बिल संशोधित कराने की कृपा की जाए ताकि समय पर भुगतान किया जा सके।",
      en: "With due respect, I state that I have received an excessively inflated electricity bill this month, which does not match actual consumption. Kindly inspect the meter reading and revise the bill accordingly."
    },
    customFields: { showConsumerNo: true },
  },
  {
    id: "ration-add-member",
    category: { hi: "खाद्य एवं रसद विभाग", en: "Food & Civil Supplies" },
    title: { hi: "राशन कार्ड में सदस्य का नाम जुड़वाने हेतु", en: "Add Family Member in Ration Card" },
    recipientTitle: { hi: "श्रीमान पूर्ति निरीक्षक / खंड विकास अधिकारी", en: "The Supply Inspector / BDO" },
    recipientOrg: { hi: "खाद्य एवं रसद विभाग, तहसील कार्यालय", en: "Food & Civil Supplies Department" },
    recipientLocation: { hi: "तहसील, जनपद", en: "Tehsil, District" },
    defaultSubject: {
      hi: "राशन कार्ड में नए पारिवारिक सदस्य का नाम दर्ज कराने हेतु",
      en: "Application for inclusion of family member name in Ration Card"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी के परिवार के नए सदस्य का नाम अभी तक उक्त राशन कार्ड में सम्मिलित नहीं हो सका है। सदस्य के सभी आवश्यक पहचान पत्र संलग्न किए जा रहे हैं। अतः पात्रता अनुसार सदस्य का नाम राशन कार्ड में जोड़ने की कृपा करें।",
      en: "Most respectfully, I state that my family member's name is yet to be added to our Ration Card. Necessary supporting identity documents are enclosed. Kindly add the member to the ration database."
    },
    customFields: { showRationNo: true },
  },
  {
    id: "dm-application",
    category: { hi: "सरकारी कार्यालय एवं अधिकारी", en: "Govt. Administration" },
    title: { hi: "जिलाधिकारी (DM) को प्रार्थना-पत्र", en: "Application to District Magistrate" },
    recipientTitle: { hi: "श्रीमान जिलाधिकारी महोदय", en: "The District Magistrate" },
    recipientOrg: { hi: "कलेक्ट्रेट कार्यालय", en: "Collectorate Office" },
    recipientLocation: { hi: "जनपद, उत्तर प्रदेश", en: "District, Uttar Pradesh" },
    defaultSubject: {
      hi: "जनसमस्या निवारण एवं आवश्यक हस्तक्षेप हेतु प्रार्थना-पत्र",
      en: "Application seeking redressal of grievance and necessary intervention"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी निम्नलिखित प्रकरण के संबंध में श्रीमान जी के संज्ञान में यह विषय प्रस्तुत कर रहा है। पूर्व में भी स्थानीय स्तर पर सूचना दी गई थी परंतु अभी तक कोई ठोस समाधान नहीं हो सका है।",
      en: "Most respectfully, I submit this application to bring an important public/personal grievance to your kind notice. Despite prior representations at local levels, an effective resolution is still awaited."
    },
  },
  {
    id: "sdm-land",
    category: { hi: "सरकारी कार्यालय एवं अधिकारी", en: "Govt. Administration" },
    title: { hi: "SDM / तहसीलदार को पैमाइश अर्जी", en: "Land Demarcation Request (SDM)" },
    recipientTitle: { hi: "श्रीमान उपजिलाधिकारी महोदय", en: "The Sub-Divisional Magistrate (SDM)" },
    recipientOrg: { hi: "तहसील कार्यालय", en: "Tehsil Office" },
    recipientLocation: { hi: "तहसील, जनपद", en: "Tehsil, District" },
    defaultSubject: {
      hi: "कृषि भूमि की पैमाइश एवं सीमांकन कराए जाने के संबंध में",
      en: "Application for official measurement and demarcation of agricultural land"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी की काश्तकारी भूमि की मेड़ एवं सीमा को लेकर विवाद की स्थिति बनी हुई है। अतः राजस्व निरीक्षक/लेखपाल की टीम गठित कर भूमि की आधिकारिक पैमाइश व सीमांकन कराने के आदेश निर्गत करने की कृपा करें।",
      en: "With due respect, I state that a boundary dispute has arisen concerning my agricultural plot. I request your good office to constitute a revenue team for conducting an official land survey and demarcation."
    },
  },
  {
    id: "school-leave",
    category: { hi: "स्कूल एवं कॉलेज", en: "School & College" },
    title: { hi: "स्कूल / कॉलेज अवकाश आवेदन", en: "Leave Application (School/College)" },
    recipientTitle: { hi: "श्रीमान प्रधानाचार्य महोदय", en: "The Principal" },
    recipientOrg: { hi: "विद्यालय / महाविद्यालय का नाम", en: "School / College Name" },
    recipientLocation: { hi: "स्थान", en: "City / Location" },
    defaultSubject: {
      hi: "अस्वस्थ होने / आवश्यक कार्यवश अवकाश प्रदान करने हेतु",
      en: "Application for grant of leave due to indisposition / urgent work"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी को अचानक आवश्यक घरेलू कार्य/स्वास्थ्य खराब होने के कारण नियमित रूप से कक्षा में उपस्थित रहने में असमर्थता है। अतः प्रार्थी को वांछित अवधि का अवकाश प्रदान करने की कृपा करें।",
      en: "Respectfully, I beg to submit that due to sudden illness / urgent personal engagement, I am unable to attend my classes. I kindly request you to grant me leave for the specified period."
    },
    customFields: { showRollNo: true },
  },
  {
    id: "school-tc",
    category: { hi: "स्कूल एवं कॉलेज", en: "School & College" },
    title: { hi: "स्थानांतरण प्रमाणपत्र (TC) हेतु", en: "Transfer Certificate (TC) Application" },
    recipientTitle: { hi: "श्रीमान प्रधानाचार्य महोदय", en: "The Principal" },
    recipientOrg: { hi: "विद्यालय का नाम", en: "School / Institution Name" },
    recipientLocation: { hi: "स्थान", en: "City / Location" },
    defaultSubject: {
      hi: "स्थानांतरण प्रमाणपत्र (T.C.) एवं चरित्र प्रमाणपत्र निर्गत करने हेतु",
      en: "Application for issuance of Transfer Certificate (T.C.) & Character Certificate"
    },
    defaultBody: {
      hi: "सविनय निवेदन है कि प्रार्थी ने आपके विद्यालय से परीक्षा उत्तीर्ण कर ली है। अब आगामी उच्च शिक्षा में प्रवेश लेने हेतु मूल स्थानांतरण प्रमाणपत्र की आवश्यकता है। विद्यालय के सभी देय शुल्क चुकता कर दिए गए हैं।",
      en: "With due respect, I state that I have completed my course from your esteemed institution. In order to pursue further studies, I require my original Transfer and Character Certificates. All institutional dues have been settled."
    },
    customFields: { showRollNo: true },
  },
  {
    id: "self-declaration",
    category: { hi: "घोषणा पत्र", en: "Declaration" },
    title: { hi: "स्व-घोषणा पत्र (Self Declaration)", en: "Self Declaration Undertaking" },
    recipientTitle: { hi: "सक्षम प्राधिकारी / संबंधित विभाग", en: "The Competent Authority / Department" },
    recipientOrg: { hi: "उत्तर प्रदेश शासन / संबंधित संस्था", en: "Government Authority / Institution" },
    recipientLocation: { hi: "स्थान", en: "Location" },
    defaultSubject: {
      hi: "दस्तावेजों एवं तथ्यों की सत्यता के संबंध में स्व-घोषणा पत्र",
      en: "Self-declaration undertaking regarding veracity of facts and records"
    },
    defaultBody: {
      hi: "मैं एतद्द्वारा सत्यनिष्ठा पूर्वक घोषणा करता/करती हूँ कि मेरे द्वारा दिए गए सभी विवरण एवं संलग्न प्रपत्र पूर्णतः सत्य व सही हैं। यदि कोई भी तथ्य असत्य या भ्रामक पाया जाता है, तो इसके विधिक परिणामों के लिए मैं स्वयं उत्तरदायी रहूँगा/रहूँगी।",
      en: "I hereby solemnly declare and affirm that all the particulars and documents furnished by me are true, correct, and complete to the best of my knowledge. If any detail is found false or misrepresented, I shall be solely liable for the legal consequences."
    },
  },
  {
    id: "custom-free",
    category: { hi: "कस्टम पत्र", en: "Custom Document" },
    title: { hi: "अपना मैटर खुद लिखें (Custom Letter)", en: "Write Custom Letter / Matter" },
    recipientTitle: { hi: "सेवा में, श्रीमान संबंधित अधिकारी", en: "To, The Respected Officer" },
    recipientOrg: { hi: "विभाग / संस्था का नाम", en: "Department / Organization" },
    recipientLocation: { hi: "स्थान", en: "City / District" },
    defaultSubject: { hi: "विषय यहाँ दर्ज करें", en: "Enter Subject Here" },
    defaultBody: {
      hi: "अपनी पूरी बात यहाँ टाइप करें या मोबाइल कीबोर्ड के माइक से बोलकर लिखें...",
      en: "Type your detailed text here or speak using your mobile keyboard microphone..."
    },
  },
];

export default function DemoDocumentPage() {
  const [lang, setLang] = useState<Language>("hi");
  const [relation, setRelation] = useState<RelationType>("son");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("police-general");

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  const [recipientTitle, setRecipientTitle] = useState(currentTemplate.recipientTitle[lang]);
  const [recipientOrg, setRecipientOrg] = useState(currentTemplate.recipientOrg[lang]);
  const [recipientLocation, setRecipientLocation] = useState(currentTemplate.recipientLocation[lang]);
  const [subject, setSubject] = useState(currentTemplate.defaultSubject[lang]);
  const [bodyText, setBodyText] = useState(currentTemplate.defaultBody[lang]);

  const [senderName, setSenderName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [place, setPlace] = useState("");

  const [opponentDetails, setOpponentDetails] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [consumerNo, setConsumerNo] = useState("");
  const [rationNo, setRationNo] = useState("");

  // संलग्नक (Enclosures) स्टेट
  const [enclosureIdProof, setEnclosureIdProof] = useState(true);
  const [enclosurePassbook, setEnclosurePassbook] = useState(false);
  const [enclosurePhoto, setEnclosurePhoto] = useState(false);
  const [enclosureCustom, setEnclosureCustom] = useState("");

  const [copied, setCopied] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    setRecipientTitle(currentTemplate.recipientTitle[newLang]);
    setRecipientOrg(currentTemplate.recipientOrg[newLang]);
    setRecipientLocation(currentTemplate.recipientLocation[newLang]);
    setSubject(currentTemplate.defaultSubject[newLang]);
    setBodyText(currentTemplate.defaultBody[newLang]);
  };

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const t = TEMPLATES.find((item) => item.id === id);
    if (!t) return;
    setSelectedTemplateId(id);
    setRecipientTitle(t.recipientTitle[lang]);
    setRecipientOrg(t.recipientOrg[lang]);
    setRecipientLocation(t.recipientLocation[lang]);
    setSubject(t.defaultSubject[lang]);
    setBodyText(t.defaultBody[lang]);
    
    // बैंक टेम्पलेट पर पासबुक संलग्नक ऑटो ऑन करें
    if (t.id.startsWith("bank-")) {
      setEnclosurePassbook(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = async () => {
    const fullText = `सेवा में,
${recipientTitle}
${recipientOrg}, ${recipientLocation}

विषय: ${subject}

महोदय,
सविनय निवेदन है कि प्रार्थी ${senderName || "___________"} ${guardianName ? `(सुपुत्र/सुपुत्री श्री ${guardianName})` : ""}, निवासी ${address || "___________"}${accountNo ? `, खाता सं: ${accountNo}` : ""}${consumerNo ? `, उपभोक्ता सं: ${consumerNo}` : ""}${rationNo ? `, राशन कार्ड सं: ${rationNo}` : ""} का/की है।

${bodyText}

अतः आपसे विनम्र निवेदन है कि मामले पर उचित कार्रवाई करने की कृपा करें।

दिनांक: ${date}
स्थान: ${place || "___________"}
प्रार्थी: ${senderName || "___________"}
मोबाइल: ${mobile || "___________"}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert("कॉपी नहीं हो सका, कृपया मैन्युअली चुनें।");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: subject || (lang === "hi" ? "प्रार्थना-पत्र" : "Application"),
          text: `${subject}\n${lang === "hi" ? "आवेदक" : "Applicant"}: ${senderName || "---"}\n${lang === "hi" ? "तारीख" : "Date"}: ${date}\nExamSewa Document Maker`,
        });
      } catch (err) {
        window.print();
      }
    } else {
      window.print();
    }
  };

  const handleExportJPG = () => {
    const printArea = documentRef.current;
    if (!printArea) return;

    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 14px; padding: 40px; background: white; color: black;">
            <h2 style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px;">${subject}</h2>
            <p><strong>${lang === "hi" ? "सेवा में" : "To"}:</strong> ${recipientTitle}, ${recipientOrg}, ${recipientLocation}</p>
            <p><strong>${lang === "hi" ? "आवेदक" : "Applicant"}:</strong> ${senderName} (${guardianName}) - ${address}</p>
            <div style="margin-top: 20px; line-height: 1.6; white-space: pre-wrap;">${bodyText}</div>
            <div style="margin-top: 40px; display: flex; justify-content: space-between;">
              <span>${lang === "hi" ? "दिनांक" : "Date"}: ${date}</span>
              <span>${lang === "hi" ? "हस्ताक्षर" : "Signature"}: ${senderName}</span>
            </div>
          </div>
        </foreignObject>
      </svg>
    `;

    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 794;
      canvas.height = 1123;
      const context = canvas.getContext("2d");
      if (context) {
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        const pngURL = canvas.toDataURL("image/jpeg", 0.95);
        const downloadLink = document.createElement("a");
        downloadLink.href = pngURL;
        downloadLink.download = `${subject.slice(0, 20) || "document"}.jpg`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category[lang])));

  const fontClassMap = {
    small: "text-[12px] leading-6",
    medium: "text-[14px] leading-7",
    large: "text-[16px] leading-8",
  };

  const activeEnclosures: string[] = [];
  if (enclosureIdProof) activeEnclosures.push(lang === "hi" ? "पहचान पत्र की छायाप्रति" : "Copy of Identity Card");
  if (enclosurePassbook) activeEnclosures.push(lang === "hi" ? "बैंक पासबुक की छायाप्रति" : "Copy of Bank Passbook");
  if (enclosurePhoto) activeEnclosures.push(lang === "hi" ? "नवीनतम पासपोर्ट साइज फोटो" : "Recent Passport Size Photograph");
  if (enclosureCustom.trim()) activeEnclosures.push(enclosureCustom.trim());

  const ActionButtons = ({ isFullWidth = false }: { isFullWidth?: boolean }) => (
    <div className={`flex flex-wrap items-center gap-2 ${isFullWidth ? "w-full" : ""}`}>
      <button
        type="button"
        onClick={handleCopyText}
        className={`bg-slate-700 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
          isFullWidth ? "flex-1" : ""
        }`}
      >
        <span>{copied ? "✅" : "📋"}</span> {copied ? (lang === "hi" ? "कॉपी हो गया!" : "Copied!") : (lang === "hi" ? "मैटर कॉपी" : "Copy Text")}
      </button>

      <button
        type="button"
        onClick={handleShare}
        className={`bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
          isFullWidth ? "flex-1" : ""
        }`}
      >
        <span>📤</span> {lang === "hi" ? "शेयर" : "Share"}
      </button>

      <button
        type="button"
        onClick={handleExportJPG}
        className={`bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
          isFullWidth ? "flex-1" : ""
        }`}
      >
        <span>🖼️</span> {lang === "hi" ? "JPG" : "JPG"}
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className={`bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-lg shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
          isFullWidth ? "flex-1" : ""
        }`}
      >
        <span>📄</span> {lang === "hi" ? "A4 PDF / प्रिंट" : "Print A4 PDF"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-3 md:p-6 font-sans text-slate-800">
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .a4-page-container {
            width: 100% !important;
            max-width: none !important;
            min-height: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* शीर्ष पट्टी */}
      <div className="max-w-6xl mx-auto mb-4 bg-white p-3.5 sm:p-4 rounded-xl shadow-xs border border-slate-200 flex flex-wrap justify-between items-center gap-3 print:hidden">
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">
            {lang === "hi" ? "दस्तावेज़ मेकर (ExamSewa Document Maker)" : "ExamSewa Document Maker"}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === "hi"
              ? "बैंक, पुलिस, बिजली, ब्लॉक एवं स्कूल प्रार्थना-पत्र तुरंत तैयार करें"
              : "Generate official bank, police, electricity, and school applications instantly"}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* बायाँ पैनल: फॉर्म */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4 print:hidden text-xs">

          {/* प्रारूप ड्रॉपडाउन */}
          <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/70 space-y-2.5">
            <label className="font-bold text-slate-800 block text-xs sm:text-sm">
              📋 {lang === "hi" ? "दस्तावेज़ का प्रारूप चुनें:" : "Select Document Template:"}
            </label>
            <select
              value={selectedTemplateId}
              onChange={handleTemplateSelect}
              className="w-full bg-white border border-blue-300 p-2.5 rounded-lg font-medium text-slate-800 focus:outline-blue-600 shadow-2xs text-xs sm:text-sm"
            >
              {categories.map((cat) => (
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {TEMPLATES.filter((t) => t.category[lang] === cat).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title[lang]}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {/* भाषा और फॉन्ट साइज कंट्रोल */}
            <div className="pt-2 flex flex-col gap-2 border-t border-blue-200/60">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">
                  🌐 {lang === "hi" ? "भाषा:" : "Language:"}
                </span>
                <div className="inline-flex rounded-lg border border-blue-300 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("hi")}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      lang === "hi" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    हिन्दी
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("en")}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      lang === "en" ? "bg-blue-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* फॉन्ट साइज */}
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 text-[11px] sm:text-xs">
                  🔤 {lang === "hi" ? "अक्षर का आकार (Font):" : "Font Size:"}
                </span>
                <div className="inline-flex rounded-lg border border-blue-300 bg-white p-0.5">
                  <button
                    type="button"
                    onClick={() => setFontSize("small")}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition cursor-pointer ${
                      fontSize === "small" ? "bg-blue-600 text-white font-bold" : "text-slate-600"
                    }`}
                  >
                    {lang === "hi" ? "छोटा" : "Small"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("medium")}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition cursor-pointer ${
                      fontSize === "medium" ? "bg-blue-600 text-white font-bold" : "text-slate-600"
                    }`}
                  >
                    {lang === "hi" ? "मध्यम" : "Normal"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontSize("large")}
                    className={`px-2 py-1 rounded text-[10px] font-medium transition cursor-pointer ${
                      fontSize === "large" ? "bg-blue-600 text-white font-bold" : "text-slate-600"
                    }`}
                  >
                    {lang === "hi" ? "बड़ा" : "Large"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* प्राप्तकर्ता विवरण */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 block">
              {lang === "hi" ? "सेवा में (प्राप्तकर्ता):" : "To (Recipient):"}
            </span>
            <input
              type="text"
              value={recipientTitle}
              onChange={(e) => setRecipientTitle(e.target.value)}
              placeholder={lang === "hi" ? "पद (जैसे: श्रीमान थाना प्रभारी महोदय)" : "Designation"}
              className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={recipientOrg}
                onChange={(e) => setRecipientOrg(e.target.value)}
                placeholder={lang === "hi" ? "थाना / बैंक / कार्यालय" : "Office / Bank / Station"}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
              <input
                type="text"
                value={recipientLocation}
                onChange={(e) => setRecipientLocation(e.target.value)}
                placeholder={lang === "hi" ? "स्थान / जनपद" : "Location / District"}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
          </div>

          {/* विषय */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              {lang === "hi" ? "विषय (Subject):" : "Subject:"}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-slate-300 p-2 rounded font-medium focus:outline-blue-500"
            />
          </div>

          {/* आवेदक विवरण */}
          <div className="space-y-2">
            <span className="font-bold text-slate-700 block">
              {lang === "hi" ? "प्रार्थी / आवेदक विवरण:" : "Applicant Details:"}
            </span>

            {/* संबंध चयन: पुत्र / पुत्री / पत्नी */}
            <div className="flex items-center gap-3 bg-slate-50 p-2 rounded border border-slate-200">
              <span className="font-semibold text-slate-600 text-[11px]">
                {lang === "hi" ? "संबंध:" : "Relation:"}
              </span>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="relation"
                  checked={relation === "son"}
                  onChange={() => setRelation("son")}
                  className="text-blue-600"
                />
                <span className="text-[11px] font-medium">{lang === "hi" ? "पुत्र (S/o)" : "Son (S/o)"}</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="relation"
                  checked={relation === "daughter"}
                  onChange={() => setRelation("daughter")}
                  className="text-blue-600"
                />
                <span className="text-[11px] font-medium">{lang === "hi" ? "पुत्री (D/o)" : "Daughter (D/o)"}</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="relation"
                  checked={relation === "wife"}
                  onChange={() => setRelation("wife")}
                  className="text-blue-600"
                />
                <span className="text-[11px] font-medium">{lang === "hi" ? "पत्नी (W/o)" : "Wife (W/o)"}</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder={lang === "hi" ? "आवेदक का पूरा नाम" : "Full Name"}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder={
                  relation === "wife"
                    ? lang === "hi" ? "पति का नाम" : "Husband Name"
                    : lang === "hi" ? "पिता का नाम" : "Father Name"
                }
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={lang === "hi" ? "पूरा पता (गाँव/मोहल्ला, पोस्ट, जिला)" : "Full Address"}
              className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
            />
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder={lang === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
              className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
            />
          </div>

          {/* विशेष फील्ड्स */}
          {currentTemplate.customFields?.showOpponent && (
            <div>
              <label className="font-bold text-slate-700 block mb-1 text-red-600">
                {lang === "hi" ? "विपक्षी / आरोपी का विवरण:" : "Opposite Party / Accused Details:"}
              </label>
              <input
                type="text"
                value={opponentDetails}
                onChange={(e) => setOpponentDetails(e.target.value)}
                placeholder={lang === "hi" ? "नाम, पिता का नाम, पता या पहचान" : "Name, Address or Identification"}
                className="w-full border border-red-200 bg-red-50/40 p-2 rounded focus:outline-red-500"
              />
            </div>
          )}

          {currentTemplate.customFields?.showIncidentDate && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === "hi" ? "घटना की तारीख व समय:" : "Date & Time of Incident:"}
              </label>
              <input
                type="text"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                placeholder={lang === "hi" ? "उदा. 12 अक्टूबर 2026, शाम 5:00 बजे" : "e.g. 12 Oct 2026, 5:00 PM"}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
          )}

          {currentTemplate.customFields?.showAccountNo && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === "hi" ? "खाता संख्या (A/c No):" : "Account Number (A/c No):"}
              </label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder={lang === "hi" ? "बैंक खाता संख्या" : "Bank Account Number"}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
          )}

          {currentTemplate.customFields?.showConsumerNo && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === "hi" ? "उपभोक्ता संख्या (Consumer No / Account ID):" : "Consumer ID / Account No:"}
              </label>
              <input
                type="text"
                value={consumerNo}
                onChange={(e) => setConsumerNo(e.target.value)}
                placeholder={lang === "hi" ? "बिजली बिल उपभोक्ता संख्या" : "Electricity Consumer Number"}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
          )}

          {currentTemplate.customFields?.showRationNo && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === "hi" ? "राशन कार्ड संख्या (Ration Card No):" : "Ration Card Number:"}
              </label>
              <input
                type="text"
                value={rationNo}
                onChange={(e) => setRationNo(e.target.value)}
                placeholder={lang === "hi" ? "डिजिटल राशन कार्ड संख्या" : "Digital Ration Card Number"}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
          )}

          {currentTemplate.customFields?.showRollNo && (
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === "hi" ? "कक्षा व अनुक्रमांक:" : "Class & Roll Number:"}
              </label>
              <input
                type="text"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder={lang === "hi" ? "कक्षा एवं रोल नंबर" : "Class and Roll No."}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
          )}

          {/* मुख्य मैटर */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">
                {lang === "hi" ? "मुख्य विवरण (घटना / मैटर):" : "Main Body / Statement:"}
              </label>
              <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {lang === "hi" ? "माइक से बोलकर भी भर सकते हैं" : "Voice typing supported"}
              </span>
            </div>
            <textarea
              rows={6}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full border border-slate-300 p-2 rounded text-xs leading-relaxed focus:outline-blue-500"
              placeholder={lang === "hi" ? "पूरी बात यहाँ विस्तार से लिखें..." : "Enter full statement here..."}
            />
          </div>

          {/* संलग्नक (Enclosures) चेकलिस्ट */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2">
            <span className="font-bold text-slate-700 block">
              📎 {lang === "hi" ? "संलग्नक (दस्तावेज साथ में जोड़ें):" : "Enclosures (Attachments):"}
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enclosureIdProof}
                  onChange={(e) => setEnclosureIdProof(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>{lang === "hi" ? "पहचान पत्र (छायाप्रति)" : "ID Proof Copy"}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enclosurePassbook}
                  onChange={(e) => setEnclosurePassbook(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>{lang === "hi" ? "बैंक पासबुक (छायाप्रति)" : "Passbook Copy"}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enclosurePhoto}
                  onChange={(e) => setEnclosurePhoto(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>{lang === "hi" ? "पासपोर्ट फोटो" : "Passport Photo"}</span>
              </label>
            </div>
            <input
              type="text"
              value={enclosureCustom}
              onChange={(e) => setEnclosureCustom(e.target.value)}
              placeholder={lang === "hi" ? "अन्य संलग्नक (जैसे: बिजली बिल, शपथ पत्र)" : "Other document (e.g. Bill, Affidavit)"}
              className="w-full border border-slate-300 p-1.5 rounded text-[11px] focus:outline-blue-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === "hi" ? "स्थान:" : "Place:"}
              </label>
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder={lang === "hi" ? "उदा. मऊ" : "e.g. Mau"}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {lang === "hi" ? "दिनांक:" : "Date:"}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 p-2 rounded focus:outline-blue-500"
              />
            </div>
          </div>

          {/* एक्शन बटन्स */}
          <div className="pt-3 border-t border-slate-200">
            <span className="font-bold text-slate-700 block mb-2 text-center text-xs">
              {lang === "hi"
                ? "दस्तावेज़ तैयार है? यहाँ से डाउनलोड या शेयर करें:"
                : "Ready to export? Share or print below:"}
            </span>
            <ActionButtons isFullWidth={true} />
          </div>
        </div>

        {/* दायाँ पैनल: A4 शीट लाइव प्रीव्यू */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            ref={documentRef}
            id="printable-document"
            className={`a4-page-container w-full max-w-[210mm] min-h-[297mm] bg-white text-black p-8 sm:p-12 shadow-lg border border-slate-300 flex flex-col justify-between ${fontClassMap[fontSize]}`}
            style={{ fontFamily: "'Noto Sans Devanagari', Arial, sans-serif" }}
          >
            <div className="space-y-4">
              {/* शीर्ष शीर्षक */}
              <div className="text-center border-b-2 border-slate-800 pb-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-wide uppercase">
                  {currentTemplate.category.hi === "घोषणा पत्र"
                    ? lang === "hi" ? "स्व-घोषणा पत्र" : "Self Declaration"
                    : currentTemplate.category.hi === "पुलिस एवं सुरक्षा"
                    ? lang === "hi" ? "शिकायत / प्रार्थना-पत्र" : "Police Complaint Application"
                    : lang === "hi" ? "प्रार्थना-पत्र" : "Formal Application"}
                </h2>
              </div>

              {/* सेवा में (To) */}
              {currentTemplate.category.hi !== "घोषणा पत्र" && (
                <div className="leading-relaxed">
                  <p className="font-semibold">{lang === "hi" ? "सेवा में," : "To,"}</p>
                  <p className="pl-4">{recipientTitle || (lang === "hi" ? "श्रीमान संबंधित अधिकारी" : "The Respected Authority")}</p>
                  <p className="pl-4">{recipientOrg || (lang === "hi" ? "कार्यालय / संस्था" : "Organization / Office")}</p>
                  <p className="pl-4">{recipientLocation || (lang === "hi" ? "स्थान / जनपद" : "Location / City")}</p>
                </div>
              )}

              {/* विषय */}
              <div className="font-bold bg-slate-50 p-2.5 rounded border border-slate-300">
                {lang === "hi" ? "विषय:" : "Subject:"} {subject || (lang === "hi" ? "अनुरोध के संबंध में" : "Regarding Request")}
              </div>

              {/* मुख्य भाग */}
              <div className="leading-relaxed space-y-3">
                <p className="font-semibold">
                  {currentTemplate.category.hi === "घोषणा पत्र"
                    ? lang === "hi" ? "घोषणा विवरण:" : "Declaration Statement:"
                    : lang === "hi" ? "महोदय," : "Respected Sir / Madam,"}
                </p>

                {/* संबंध (Relation) अनुसार सटीक शब्दावली */}
                <p className="text-justify indent-6">
                  {lang === "hi" ? (
                    <>
                      सविनय निवेदन है कि {relation === "daughter" ? "प्रार्थिनी" : relation === "wife" ? "प्रार्थिनी" : "प्रार्थी"}{" "}
                      <strong>{senderName || "___________"}</strong>
                      {guardianName ? (
                        relation === "wife"
                          ? ` (पत्नी श्री ${guardianName})`
                          : relation === "daughter"
                          ? ` (आत्मजा श्री ${guardianName})`
                          : ` (आत्मज श्री ${guardianName})`
                      ) : ""}, निवासी{" "}
                      <strong>{address || "___________________"}</strong>
                      {accountNo ? `, खाता संख्या: ${accountNo}` : ""}
                      {consumerNo ? `, उपभोक्ता सं: ${consumerNo}` : ""}
                      {rationNo ? `, राशन कार्ड सं: ${rationNo}` : ""}
                      {rollNo ? `, अनुक्रमांक/कक्षा: ${rollNo}` : ""} का/की है।
                    </>
                  ) : (
                    <>
                      Most respectfully, I beg to state that the applicant <strong>{senderName || "___________"}</strong>
                      {guardianName ? (
                        relation === "wife"
                          ? ` (W/o Mr. ${guardianName})`
                          : relation === "daughter"
                          ? ` (D/o Mr. ${guardianName})`
                          : ` (S/o Mr. ${guardianName})`
                      ) : ""}, resident of{" "}
                      <strong>{address || "___________________"}</strong>
                      {accountNo ? `, Account No: ${accountNo}` : ""}
                      {consumerNo ? `, Consumer No: ${consumerNo}` : ""}
                      {rationNo ? `, Ration Card No: ${rationNo}` : ""}
                      {rollNo ? `, Roll No / Class: ${rollNo}` : ""} is submitting this representation.
                    </>
                  )}
                </p>

                {(incidentDate || opponentDetails) && (
                  <div className="bg-slate-50/70 p-2.5 rounded border border-slate-200 text-xs space-y-1">
                    {incidentDate && (
                      <p>
                        <strong>{lang === "hi" ? "घटना का समय/दिनांक:" : "Date & Time of Incident:"}</strong> {incidentDate}
                      </p>
                    )}
                    {opponentDetails && (
                      <p>
                        <strong>{lang === "hi" ? "विपक्षी / संबंधित व्यक्ति:" : "Opposite Party / Accused:"}</strong> {opponentDetails}
                      </p>
                    )}
                  </div>
                )}

                {/* मुख्य मैटर */}
                <div className="text-justify indent-6 whitespace-pre-line text-slate-800">
                  {bodyText}
                </div>

                {/* समापन */}
                <p className="text-justify indent-6">
                  {lang === "hi"
                    ? `अतः श्रीमान जी से विनम्र निवेदन है कि मामले का संज्ञान लेते हुए आवश्यक विधिक/प्रशासनिक कार्रवाई करने की कृपा करें। इसके लिए ${relation === "daughter" || relation === "wife" ? "प्रार्थिनी" : "प्रार्थी"} सदैव आपका आभारी रहेगा/रहेगी।`
                    : "Therefore, I earnestly request you to kindly take cognizance of the matter and initiate necessary action at the earliest. I shall remain grateful for your kind assistance."}
                </p>

                {/* संलग्नक प्रिव्यू (Enclosures) */}
                {activeEnclosures.length > 0 && (
                  <div className="pt-2 text-xs">
                    <p className="font-bold underline mb-1">
                      {lang === "hi" ? "संलग्नक (दस्तावेज):" : "Enclosures:"}
                    </p>
                    <ol className="list-decimal pl-5 space-y-0.5">
                      {activeEnclosures.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* पाद लेख */}
            <div className="avoid-break pt-6 mt-4 flex justify-between items-end border-t border-slate-200">
              <div className="space-y-0.5">
                <p><strong>{lang === "hi" ? "स्थान:" : "Place:"}</strong> {place || "____________"}</p>
                <p><strong>{lang === "hi" ? "दिनांक:" : "Date:"}</strong> {date}</p>
              </div>

              <div className="text-right space-y-0.5">
                <div className="h-10 flex items-end justify-end">
                  <span className="text-[11px] text-slate-400 border-b border-dashed border-slate-400 px-6 pb-0.5">
                    {lang === "hi" ? "(हस्ताक्षर / अँगूठे का निशान)" : "(Signature / Thumb Impression)"}
                  </span>
                </div>
                <p className="font-bold">
                  {senderName || (lang === "hi" ? (relation === "daughter" || relation === "wife" ? "प्रार्थिनी" : "प्रार्थी") : "Applicant")}
                </p>
                {guardianName && (
                  <p className="text-[11px] text-slate-600">
                    {relation === "wife"
                      ? lang === "hi" ? `पति: ${guardianName}` : `Husband: ${guardianName}`
                      : lang === "hi" ? `पिता: ${guardianName}` : `Father: ${guardianName}`}
                  </p>
                )}
                {mobile && (
                  <p className="text-[11px] text-slate-600">
                    {lang === "hi" ? `मो: ${mobile}` : `Mob: ${mobile}`}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
