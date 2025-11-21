import React, { useState, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FileUp, BarChart2, Download, FileText, RefreshCw, Search, ShieldCheck } from 'lucide-react';
import { processFile, generateStudentPDF, generateMasterJSON, generateAllReports, mockData } from './services/processor';
import { StudentData, ParsingStats } from './types';

const App: React.FC = () => {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [stats, setStats] = useState<ParsingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStudents([]);
    setStats(null);

    try {
      const { data, stats } = await processFile(file);
      setStudents(data);
      setStats(stats);
      toast.success(`Successfully parsed ${data.length} records!`);
    } catch (err: any) {
      console.error(err);
      triggerError();
      toast.error(err.message || "Failed to parse file");
    } finally {
      setLoading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const loadSampleData = () => {
    setLoading(true);
    setTimeout(() => {
      const { data, stats } = mockData();
      setStudents(data);
      setStats(stats);
      setLoading(false);
      toast.success("Loaded sample data successfully!");
    }, 800);
  };

  const triggerError = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 820);
  };

  const handleDownloadReport = (student: StudentData) => {
    try {
      generateStudentPDF(student);
      toast.success(`Report downloaded for ${student.regNo}`);
    } catch (e) {
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadAll = async () => {
    if (students.length === 0) return;
    const confirm = window.confirm(`Generate ${students.length} PDF files? This might take a moment.`);
    if (!confirm) return;

    setLoading(true);
    try {
      await generateAllReports(students);
      toast.success("All reports generated!");
    } catch (e) {
      toast.error("Error generating batch reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMaster = () => {
    if (students.length === 0) return;
    generateMasterJSON(students);
    toast.success("Master dataset downloaded");
  };

  // Filter students for the table
  const filteredStudents = students.filter(s => 
    s.regNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 20); // Limit preview to 20

  return (
    <div className="min-h-screen p-4 md:p-8 text-slate-200 flex flex-col">
      <Toaster position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto space-y-8 flex-grow w-full">
        {/* Header */}
        <header className="text-center space-y-4 animate-fade-in pt-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neonBlue to-neonPink drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]">
            SKP Grade Analyzer
          </h1>
          <p className="text-slate-400 text-lg">Client-side Result Parsing & Report Generation</p>
        </header>

        {/* Control Panel */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${errorShake ? 'animate-shake' : ''}`}>
          
          {/* Upload Card */}
          <div className="lg:col-span-2 bg-glass backdrop-blur-xl border border-glassBorder rounded-2xl p-8 shadow-lg relative overflow-hidden group transition-all hover:border-neonBlue/30">
            <div className="absolute inset-0 bg-gradient-to-r from-neonBlue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6">
              <div className="w-full max-w-md">
                <label 
                  htmlFor="file-upload" 
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-neonBlue hover:bg-slate-800/50 transition-all duration-300 group/upload"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FileUp className="w-12 h-12 text-slate-400 group-hover/upload:text-neonBlue transition-colors mb-3" />
                    <p className="mb-2 text-sm text-slate-300">
                      <span className="font-semibold text-neonBlue">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-slate-500">PDF, XLSX, CSV (Max 10MB)</p>
                  </div>
                  <input id="file-upload" type="file" className="hidden" accept=".pdf,.csv,.xlsx,.xls" onChange={handleFileUpload} disabled={loading} />
                </label>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={loadSampleData}
                  disabled={loading}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-sm rounded-lg border border-slate-600 transition-all flex items-center gap-2 hover:text-neonGreen"
                >
                  <RefreshCw size={16} /> Use Sample Data
                </button>
              </div>
            </div>

            {loading && (
               <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                 <div className="w-16 h-16 border-4 border-neonBlue border-t-transparent rounded-full animate-spin shadow-[0_0_15px_#00f3ff]"></div>
                 <p className="mt-4 text-neonBlue font-medium animate-pulse">Crunching Data...</p>
               </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-glass backdrop-blur-xl border border-glassBorder rounded-2xl p-6 shadow-lg flex flex-col justify-between">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
              <BarChart2 className="text-neonPink" /> Analysis Stats
            </h2>
            
            <div className="flex-1 flex flex-col justify-center space-y-6 mt-4">
              {stats ? (
                <>
                  <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Total Students</span>
                    <span className="text-3xl font-bold text-white">{stats.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                    <span className="text-slate-400">Passed All</span>
                    <span className="text-2xl font-bold text-neonGreen">{stats.totalPassed}</span>
                  </div>
                  <div className="flex justify-between items-end border-b border-slate-700 pb-2">
                    <span className="text-slate-400">With Backlogs</span>
                    <span className="text-2xl font-bold text-red-400">{stats.totalFailed}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Avg Score: {stats.averageScore.toFixed(1)}%
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500 py-10 italic">
                  Upload a file to see statistics
                </div>
              )}
            </div>

            {stats && (
               <div className="mt-6 space-y-3">
                 <button 
                  onClick={handleDownloadAll}
                  className="w-full py-2.5 bg-gradient-to-r from-neonBlue to-blue-600 rounded-lg font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                   <FileText size={18} /> Generate All Reports
                 </button>
                 <button 
                  onClick={handleDownloadMaster}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-slate-300"
                 >
                   <Download size={18} /> Export Master JSON
                 </button>
               </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        {students.length > 0 && (
          <div className="bg-glass backdrop-blur-xl border border-glassBorder rounded-2xl overflow-hidden shadow-xl animate-fade-in">
            <div className="p-6 border-b border-glassBorder flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-xl font-semibold text-white">Student Preview <span className="text-sm font-normal text-slate-400">(Top 20 results)</span></h3>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search RegNo or Name..." 
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:border-neonBlue text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/60 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4 font-medium tracking-wider">Reg No</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Name</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Result</th>
                    <th className="px-6 py-4 font-medium tracking-wider">Absents</th>
                    <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredStudents.map((student, index) => (
                    <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-neonBlue">{student.regNo}</td>
                      <td className="px-6 py-4 font-medium text-white">{student.name || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          student.resultStatus === 'PASS' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {student.resultStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">{student.absentCount}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDownloadReport(student)}
                          className="text-neonBlue hover:text-white transition-colors font-medium text-xs border border-neonBlue/30 hover:bg-neonBlue/20 px-3 py-1 rounded"
                        >
                          Report
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No students found matching your search.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Watermark Footer */}
      <footer className="mt-12 py-6 text-center border-t border-white/5">
          <p className="font-mono text-neonBlue/60 text-sm hover:text-neonBlue transition-colors duration-300 select-none">
             Created by Tharun R CSE (2022-2026)
          </p>
      </footer>
    </div>
  );
};

export default App;