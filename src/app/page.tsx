import Link from "next/link";

const tools = [
  {
    title: "Photo Resize",
    description: "Resize your photo for online applications.",
    href: "/tools/photo-resize",
  },
  {
    title: "Signature Resize",
    description: "Prepare your signature in the required size.",
    href: "/tools/signature-resize",
  },
  {
    title: "Exact KB Compressor",
    description: "Compress an image to your required KB range.",
    href: "/tools/exact-kb-compressor",
  },
  {
    title: "Exact Pixel Resize",
    description: "Set exact image width and height in pixels.",
    href: "/tools/exact-pixel-resize",
  },
  {
    title: "Image Converter",
    description: "Convert JPG, PNG and WebP images easily.",
    href: "/tools/image-format-converter",
  },
  {
    title: "Image to PDF",
    description: "Convert images into a PDF document.",
    href: "/tools/image-to-pdf",
  },
  {
    title: "PDF Compressor",
    description: "Prepare PDFs for online submission.",
    href: "/tools/pdf-compress",
  },
  {
    title: "PDF Merge / Split",
    description: "Merge or split PDF documents.",
    href: "/tools/pdf-merge-split",
  },
];

const steps = [
  {
    number: "01",
    title: "Prepare",
    description: "Get your photo, signature and documents ready.",
  },
  {
    number: "02",
    title: "Study",
    description: "Access notes, subjects and exam resources.",
  },
  {
    number: "03",
    title: "Practice",
    description: "Practice MCQs, PYQs and tests.",
  },
  {
    number: "04",
    title: "Form Ready",
    description: "Check photo, signature, size and documents.",
  },
  {
    number: "05",
    title: "Submit",
    description: "Complete your application with confidence.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            Study<span className="text-blue-600">Setu</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <a href="#study" className="hover:text-blue-600">
              Study
            </a>
            <a href="#practice" className="hover:text-blue-600">
              Practice
            </a>
            <a href="#tools" className="hover:text-blue-600">
              Tools
            </a>
            <a href="#form-ready" className="hover:text-blue-600">
              Form Ready
            </a>
          </nav>

          <Link
            href="/tools/exam-requirements"
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              Student Digital Workspace
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
              Your Complete Student
              <span className="block text-blue-600">Digital Workspace</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              Prepare smarter. Study better. Practice more. Get your
              application ready.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <a
                href="#tools"
                className="rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg hover:bg-blue-700"
              >
                Start Preparing
              </a>

              <a
                href="#study"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-bold text-slate-800 hover:bg-slate-50"
              >
                Explore Study
              </a>
            </div>
          </div>

          {/* Workflow */}
          <div className="mt-14 grid gap-3 sm:grid-cols-5">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center"
              >
                <div className="text-sm font-black text-blue-600">
                  {step.number}
                </div>
                <div className="mt-1 font-extrabold">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="#study"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">📚</div>
            <h2 className="mt-4 text-xl font-extrabold">Study</h2>
            <p className="mt-2 text-sm text-slate-600">
              Notes, subjects and learning resources.
            </p>
          </a>

          <a
            href="#practice"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">📝</div>
            <h2 className="mt-4 text-xl font-extrabold">Practice</h2>
            <p className="mt-2 text-sm text-slate-600">
              MCQs, PYQs and tests for preparation.
            </p>
          </a>

          <a
            href="#tools"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">🛠️</div>
            <h2 className="mt-4 text-xl font-extrabold">Tools</h2>
            <p className="mt-2 text-sm text-slate-600">
              Photo, signature, image and PDF tools.
            </p>
          </a>

          <a
            href="#form-ready"
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="text-3xl">✅</div>
            <h2 className="mt-4 text-xl font-extrabold">Form Ready</h2>
            <p className="mt-2 text-sm text-slate-600">
              Check your application files before submission.
            </p>
          </a>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="font-bold text-blue-400">APPLICATION TOOLS</p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Get your files Form Ready
            </h2>
            <p className="mt-4 text-slate-300">
              Prepare photos, signatures and PDFs for online applications.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="rounded-2xl border border-slate-700 bg-slate-800 p-5 transition hover:border-blue-400 hover:bg-slate-700"
              >
                <h3 className="font-extrabold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {tool.description}
                </p>
                <span className="mt-4 inline-block text-sm font-bold text-blue-400">
                  Open Tool →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Study */}
      <section id="study" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <p className="font-bold text-blue-600">STUDY</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Learn with focused resources
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            StudySetu will bring notes, MCQs, previous year questions,
            revision sheets and exam-focused resources into one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Notes", "MCQs", "PYQs", "One Page Revision"].map((item) => (
              <div
                key={item}
                className="rounded-2xl bg-slate-50 p-5 font-extrabold"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice */}
      <section id="practice" className="bg-blue-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-bold text-blue-600">PRACTICE</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Practice before the real exam
          </h2>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Topic Tests", "Test yourself topic by topic."],
              ["Mock Tests", "Prepare with complete exam practice."],
              ["Previous Questions", "Practice from previous year questions."],
              ["Performance", "Track your progress as the platform grows."],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-blue-100 bg-white p-6"
              >
                <h3 className="font-extrabold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Ready */}
      <section id="form-ready" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 p-8 text-white sm:p-12">
          <p className="font-bold text-blue-400">FORM READY</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">
            Prepare your application step by step
          </h2>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {[
              "Photo",
              "Signature",
              "KB Size",
              "Pixel Size",
              "PDF / Documents",
              "Ready to Submit",
            ].map((item, index) => (
              <div
                key={item}
                className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-center text-sm font-bold"
              >
                <span className="mr-1 text-blue-400">{index + 1}.</span>
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/tools/exam-requirements"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white hover:bg-blue-700"
            >
              Check Exam Requirements
            </Link>
          </div>
        </div>
      </section>

      {/* Exam Categories */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-bold text-blue-600">EXAM PREPARATION</p>
          <h2 className="mt-2 text-3xl font-black">
            Prepare for your target exam
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["SSC", "Railway", "Banking", "Police"].map((exam) => (
              <div
                key={exam}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-xl font-extrabold">{exam}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Exam-focused preparation and application support.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="text-xl font-black">
              Study<span className="text-blue-600">Setu</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Prepare → Study → Practice → Form Ready → Submit
            </p>
          </div>

          <div className="flex flex-wrap gap-5 text-sm font-semibold text-slate-600">
            <a href="#study" className="hover:text-blue-600">
              Study
            </a>
            <a href="#practice" className="hover:text-blue-600">
              Practice
            </a>
            <a href="#tools" className="hover:text-blue-600">
              Tools
            </a>
            <a href="#form-ready" className="hover:text-blue-600">
              Form Ready
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
