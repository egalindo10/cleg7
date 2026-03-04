import React, { useState } from "react";
import {
  BookOpen,
  Download,
  FileText,
  Languages,
  Loader2,
  Plus,
  Settings2,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { generateLesson, LessonParams, LessonResponse } from "./services/gemini";
import { exportLesson } from "./utils/exporter";
import { printExportPages, printStudentPacket } from "./utils/printExportPages";
import { LessonExportTemplate } from "./components/LessonExportTemplate";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);

  const [params, setParams] = useState<LessonParams>({
    language: "Spanish",
    actflMode: "Interpretive",
    skill: "Reading",
    level: "Novice",
    theme: "",
    functions: "",
    time: "60 minutes",
    stateStandards: ""
  });

  const [exporting, setExporting] = useState<"pdf" | "png" | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await generateLesson(params);
      setLesson(result);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate lesson. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "pdf" | "png") => {
    if (!lesson) return;

    setExporting(format);

    await exportLesson(
      "lesson-export",
      `${params.language} ${params.level} Lesson`,
      format
    );

    setExporting(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">

      {/* Header */}
      <header className="border-b border-slate-200 p-6 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white flex items-center justify-center rounded-xl shadow-lg shadow-indigo-200">
            <Languages size={24} />
          </div>

          <div>
            <h1 className="font-serif italic text-2xl leading-none text-indigo-900">
              CL Lengua Gen
            </h1>

            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-1">
              ACTFL Aligned Lesson Generator by Evelyn Galindo
            </p>
          </div>
        </div>

        {lesson && (
          <div className="flex items-center gap-3">

            {/* PRINT BUTTON */}
            <button
              onClick={() =>
                printExportPages(
                  "lesson-export",
                  `${params.language} ${params.level} Lesson`
                )
              }
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium"
            >
              <Download size={16} />
              Print
            </button>

            {/* PNG EXPORT */}
            <button
              onClick={() => handleExport("png")}
              disabled={!!exporting}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all text-sm font-medium disabled:opacity-50"
            >
              {exporting === "png"
                ? <Loader2 size={16} className="animate-spin" />
                : <FileText size={16} />}
              PNG
            </button>

            {/* PDF EXPORT */}
            <button
              onClick={() => handleExport("pdf")}
              disabled={!!exporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all text-sm font-medium disabled:opacity-50"
            >
              {exporting === "pdf"
                ? <Loader2 size={16} className="animate-spin" />
                : <Download size={16} />}
              PDF
            </button>

          </div>
        )}
      </header>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] min-h-[calc(100vh-89px)]">

        {/* Sidebar */}
        <aside className="border-r border-slate-200 p-8 bg-indigo-900 text-white">

          <div className="flex items-center gap-2 mb-8">
            <Settings2 size={18} className="text-indigo-300" />
            <h2 className="font-serif italic text-lg text-indigo-100">
              Configuration
            </h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">

            {/* Language */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-2">
                <Languages size={12} />
                Target Language
              </label>

              <input
                type="text"
                value={params.language}
                onChange={e =>
                  setParams({ ...params, language: e.target.value })
                }
                className="w-full bg-indigo-800/50 border-b border-indigo-700 py-2 px-3 focus:outline-none focus:border-indigo-400 rounded-t-sm"
                required
              />
            </div>

            {/* Level */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-2">
                <GraduationCap size={12} />
                Proficiency Level
              </label>

              <select
                value={params.level}
                onChange={e =>
                  setParams({ ...params, level: e.target.value })
                }
                className="w-full bg-indigo-800/50 border-b border-indigo-700 py-2 px-3"
              >
                <option className="bg-indigo-900">Novice</option>
                <option className="bg-indigo-900">Intermediate</option>
                <option className="bg-indigo-900">Advanced / AP</option>
              </select>
            </div>

            {/* Theme */}
            <div className="space-y-2">
              <label className="text-[11px] uppercase tracking-wider text-indigo-300 font-mono flex items-center gap-2">
                <BookOpen size={12} />
                Theme / Context
              </label>

              <textarea
                value={params.theme}
                onChange={e =>
                  setParams({ ...params, theme: e.target.value })
                }
                className="w-full bg-indigo-800/50 border border-indigo-700 p-3 min-h-[100px]"
                required
              />
            </div>

            {/* Generate button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 flex items-center justify-center gap-2 py-4 bg-amber-500 text-amber-950 rounded-xl hover:bg-amber-400 shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Sparkles size={18} />
                  <span className="font-bold uppercase text-sm">
                    Generate Lesson Packet
                  </span>
                </>
              )}
            </button>
          </form>
        </aside>

        {/* Preview */}
        <section className="bg-slate-50 p-12 overflow-y-auto">

          {lesson && (
            <div className="space-y-12 max-w-4xl mx-auto">

              <div className="space-y-8">
                <h2 className="font-serif italic text-3xl text-indigo-900">
                  Teacher Guide
                </h2>

                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>
                    {lesson.teacherGuide}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="space-y-8 pt-12 border-t border-slate-200">

                <h2 className="font-serif italic text-3xl text-indigo-900">
                  Student Packet
                </h2>

                <div className="prose prose-slate max-w-none bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
                  <ReactMarkdown>
                    {lesson.studentPacket}
                  </ReactMarkdown>
                </div>

              </div>

            </div>
          )}

        </section>

      </main>

      {/* Hidden export template */}
      {lesson && (
        <LessonExportTemplate
          lesson={lesson}
          params={params}
          idPrefix="lesson-export"
        />
      )}

    </div>
  );
}