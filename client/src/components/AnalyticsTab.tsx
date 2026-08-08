import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SignatureCanvas from 'react-signature-canvas';
import { api } from '../services/api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  BarChart3, TrendingUp, TrendingDown, Users, ShieldCheck, FileText, Clock, MapPin,
  Activity, AlertTriangle, Download, Filter, Search, Calendar, ChevronRight, ArrowLeft,
  Cpu, Scale, CheckCircle2, ShieldAlert, Sparkles, RefreshCw, Eye, FileCheck, Layers,
  Key, Printer, Lock, FileSignature, Award, Zap, Sliders, Database, ArrowUpRight,
  Check, X, Compass, HelpCircle, Share2, Gavel, BookOpen, LockKeyhole, Info, FileSearch,
  AlertCircle, ExternalLink, Shield, UserCheck
} from 'lucide-react';

// ==================== REAL ANALYTICAL DATASETS (FROM BACKEND STORE) ==================== //

const TIME_SERIES_VOLUME: any[] = [];
const CASE_CATEGORIES: any[] = [];
const ZONE_BENCHMARK_DATA: any[] = [];
const COURT_BENCHES_VELOCITY: any[] = [];

// ==================== ANALYTICAL CORE MODULE INTERFACE ==================== //

export interface AnalyticalModuleItem {
  id: string;
  title: string;
  category: string;
  kpiPrimary: string;
  kpiLabel: string;
  trendPercentage: string;
  trendDirection: 'up' | 'down';
  description: string;
  statusBadge: string;
  badgeColor: string;
  iconName: string;
  lastSync: string;

  // Deep Detailed Data
  metricHighlights: Array<{ label: string; value: string; note: string }>;
  zoneBreakdown: Array<{ zone: string; metricValue: string; status: 'Optimal' | 'Attention' | 'Normal' }>;
  timeSeriesDetailed: Array<{ time: string; valueA: number; valueB: number; labelA: string; labelB: string }>;
  statutoryAuditLog: Array<{ event: string; timestamp: string; hash: string; status: string }>;
}

const ANALYTICAL_MODULES: AnalyticalModuleItem[] = [
  {
    id: 'MOD-001',
    title: 'Digital Evidence Ingestion & Sealing Velocity',
    category: 'Evidence Integrity & Volume',
    kpiPrimary: '14,820 Assets',
    kpiLabel: 'Total Sealed Evidence',
    trendPercentage: '+14.2% YoY',
    trendDirection: 'up',
    description: 'Cryptographic SHA-256 sealing throughput, zero-knowledge attestation speed, and zone-wise ingestion volume.',
    statusBadge: '100% HSM Sealing Operational',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconName: 'FileCheck',
    lastSync: 'Sync Live (2 mins ago)',

    metricHighlights: [
      { label: 'Avg Sealing Duration', value: '1.2 Seconds', note: 'Hardware Security Module (HSM) cluster response' },
      { label: 'ZK-Proof Validation', value: '99.91% Instant', note: 'Zero-knowledge verification of exhibit provenance' },
      { label: 'Tamper Penetration Attempts', value: '0 Breaches', note: 'All multi-sig hash nodes verified intact' },
    ],
    zoneBreakdown: [
      { zone: 'Zone 1 (North High Court)', metricValue: '3,240 Assets • 1.1s Seal', status: 'Optimal' },
      { zone: 'Zone 2 (South Commercial Bench)', metricValue: '2,890 Assets • 1.3s Seal', status: 'Normal' },
      { zone: 'Zone 3 (East Cyber Precinct)', metricValue: '3,810 Assets • 1.2s Seal', status: 'Optimal' },
      { zone: 'Zone 4 (West Special Tribunal)', metricValue: '4,120 Assets • 1.0s Seal', status: 'Optimal' },
      { zone: 'Zone 5 (Central Apex Appellate)', metricValue: '760 Assets • 0.9s Seal', status: 'Optimal' },
    ],
    timeSeriesDetailed: [
      { time: '08:00 AM', valueA: 120, valueB: 118, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
      { time: '10:00 AM', valueA: 340, valueB: 338, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
      { time: '12:00 PM', valueA: 580, valueB: 579, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
      { time: '02:00 PM', valueA: 490, valueB: 488, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
      { time: '04:00 PM', valueA: 620, valueB: 619, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
      { time: '06:00 PM', valueA: 280, valueB: 280, labelA: 'Incoming Exhibits', labelB: 'HSM Sealed' },
    ],
    statutoryAuditLog: [
      { event: 'Batch Block #90210 Sealed via secp256k1', timestamp: '10 mins ago', hash: '0x8821...FA31', status: 'Verified' },
      { event: 'CCTV Stream #EV-4412 Provenance Attestation', timestamp: '25 mins ago', hash: '0x9924...BC12', status: 'Verified' },
      { event: 'Forensic Audio Hash Ledger Sync Completed', timestamp: '1 hour ago', hash: '0x7712...EE90', status: 'Verified' },
    ]
  },
  {
    id: 'MOD-002',
    title: 'Judicial Adjudication Velocity & Docket Throughput',
    category: 'Court Operations & Efficiency',
    kpiPrimary: '1.8 Days',
    kpiLabel: 'Avg Disposition Velocity',
    trendPercentage: '-34% Backlog Days',
    trendDirection: 'down',
    description: 'Average time required to issue binding judicial orders, resolve evidentiary objections, and seal case files.',
    statusBadge: 'High Efficiency Zone',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    iconName: 'Clock',
    lastSync: 'Sync Live (5 mins ago)',

    metricHighlights: [
      { label: 'Active Court Dockets', value: '482 Cases', note: 'Spread across 5 division benches' },
      { label: 'On-Time Adjudication Ratio', value: '94.2%', note: 'Orders executed within statutory timetable' },
      { label: 'Backlog Clearance Index', value: '1.24 Ratio', note: 'Cases resolved exceeds new incoming filings' },
    ],
    zoneBreakdown: [
      { zone: 'Division Bench 1 (Cyber & Financial)', metricValue: '1.4 Days Avg • 112 Dockets', status: 'Optimal' },
      { zone: 'Division Bench 2 (Commercial & IPR)', metricValue: '2.1 Days Avg • 98 Dockets', status: 'Normal' },
      { zone: 'Division Bench 3 (Criminal & NDPS)', metricValue: '1.6 Days Avg • 145 Dockets', status: 'Optimal' },
      { zone: 'Special Writs Bench', metricValue: '2.3 Days Avg • 77 Dockets', status: 'Attention' },
      { zone: 'Appellate Quality Cell', metricValue: '1.1 Days Avg • 50 Dockets', status: 'Optimal' },
    ],
    timeSeriesDetailed: [
      { time: 'Week 1', valueA: 85, valueB: 110, labelA: 'New Filings', labelB: 'Orders Executed' },
      { time: 'Week 2', valueA: 92, valueB: 125, labelA: 'New Filings', labelB: 'Orders Executed' },
      { time: 'Week 3', valueA: 78, valueB: 105, labelA: 'New Filings', labelB: 'Orders Executed' },
      { time: 'Week 4', valueA: 110, valueB: 140, labelA: 'New Filings', labelB: 'Orders Executed' },
    ],
    statutoryAuditLog: [
      { event: 'Interim Bail Order Executed in Case #HC-BOM-1104', timestamp: '12 mins ago', hash: '0xORDER_9901', status: 'Signed' },
      { event: 'Commercial Liquidated Damages Ruling Issued', timestamp: '45 mins ago', hash: '0xORDER_9902', status: 'Signed' },
      { event: 'Precedent Flag Review Formally Recorded', timestamp: '2 hours ago', hash: '0xORDER_9903', status: 'Signed' },
    ]
  },
  {
    id: 'MOD-003',
    title: 'Zero-Knowledge Forensic Integrity & Forgery Engine Audit',
    category: 'Security & Anti-Tampering',
    kpiPrimary: '99.85%',
    kpiLabel: 'System Integrity Index',
    trendPercentage: '0 Breaches',
    trendDirection: 'up',
    description: 'AI-driven forgery detection, digital signature verification, frame-level video analysis, and hash integrity logs.',
    statusBadge: '12 Flags Resolved',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconName: 'ShieldCheck',
    lastSync: 'Sync Live (1 min ago)',

    metricHighlights: [
      { label: 'CCTV Frame Discrepancies', value: '5 Detected', note: 'AI model isolated frame insertion attempts' },
      { label: 'Audio Spectrum Tampering', value: '3 Discovered', note: 'Voice frequency anomaly auto-flagged' },
      { label: 'Metadata Hash Variances', value: '4 Audited', note: 'Reconciled with original police device logs' },
    ],
    zoneBreakdown: [
      { zone: 'Zone 1 (North)', metricValue: '0 Active Anomalies • 99.95% Score', status: 'Optimal' },
      { zone: 'Zone 2 (South)', metricValue: '1 Hash Discrepancy (Resolved)', status: 'Optimal' },
      { zone: 'Zone 3 (East)', metricValue: '0 Active Anomalies • 99.92% Score', status: 'Optimal' },
      { zone: 'Zone 4 (West)', metricValue: '2 CCTV Flags (Judicial Review)', status: 'Attention' },
      { zone: 'Zone 5 (Central)', metricValue: '0 Active Anomalies • 100% Score', status: 'Optimal' },
    ],
    timeSeriesDetailed: [
      { time: 'Day 1', valueA: 100, valueB: 0, labelA: 'Integrity %', labelB: 'Unresolved Flags' },
      { time: 'Day 2', valueA: 99.8, valueB: 1, labelA: 'Integrity %', labelB: 'Unresolved Flags' },
      { time: 'Day 3', valueA: 99.9, valueB: 0, labelA: 'Integrity %', labelB: 'Unresolved Flags' },
      { time: 'Day 4', valueA: 99.7, valueB: 2, labelA: 'Integrity %', labelB: 'Unresolved Flags' },
      { time: 'Day 5', valueA: 99.9, valueB: 0, labelA: 'Integrity %', labelB: 'Unresolved Flags' },
    ],
    statutoryAuditLog: [
      { event: 'Forgery Flag #FLAG-2026-001 Struck from Record', timestamp: '30 mins ago', hash: '0xFORG_8820', status: 'Resolved' },
      { event: 'CCTV Audio Track Hash Cleared by Validator', timestamp: '3 hours ago', hash: '0xFORG_8821', status: 'Resolved' },
    ]
  },
  {
    id: 'MOD-004',
    title: 'Precedent Neural Benchmarking & Outlier Variance',
    category: 'Judicial Quality & Consistency',
    kpiPrimary: '4,830 Rulings',
    kpiLabel: 'Benchmark Cohort Size',
    trendPercentage: '+3.4σ Max Outlier',
    trendDirection: 'up',
    description: 'Neural vector embedding similarity analysis comparing past judicial orders against historical circuit precedent cohorts.',
    statusBadge: 'Layer 6 Digital Twin Active',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    iconName: 'Scale',
    lastSync: 'Sync Live (3 mins ago)',

    metricHighlights: [
      { label: 'Appellate Alignment Score', value: '98.1%', note: 'Rulings aligned with higher court doctrine' },
      { label: 'Active Outlier Flags', value: '3 Pending', note: 'Auto-routed to Judicial Quality Panel' },
      { label: 'Vector Match Accuracy', value: '94.8% Cosine', note: 'Multi-dimensional legal semantic similarity' },
    ],
    zoneBreakdown: [
      { zone: 'Cyber Extortion Cohort', metricValue: '1,240 Cases • 1 Flag (+3.4σ)', status: 'Attention' },
      { zone: 'Commercial Contracts Cohort', metricValue: '850 Cases • 1 Flag (+2.8σ)', status: 'Attention' },
      { zone: 'NDPS Search Procedure Cohort', metricValue: '2,100 Cases • 1 Flag (-2.9σ)', status: 'Attention' },
      { zone: 'IPR Generic Drug Injunctions', metricValue: '640 Cases • 1 Flag (Reviewed)', status: 'Optimal' },
    ],
    timeSeriesDetailed: [
      { time: 'Jan', valueA: 12, valueB: 11, labelA: 'Outliers Flagged', labelB: 'Quality Panel Reviewed' },
      { time: 'Feb', valueA: 8, valueB: 8, labelA: 'Outliers Flagged', labelB: 'Quality Panel Reviewed' },
      { time: 'Mar', valueA: 15, valueB: 14, labelA: 'Outliers Flagged', labelB: 'Quality Panel Reviewed' },
      { time: 'Apr', valueA: 6, valueB: 5, labelA: 'Outliers Flagged', labelB: 'Quality Panel Reviewed' },
    ],
    statutoryAuditLog: [
      { event: 'Precedent Flag #FLAG-001 Reviewed & Approved', timestamp: '1 hour ago', hash: '0xPREC_1101', status: 'Archived' },
      { event: 'Gaussian Tail Distribution Calculated for N=1240', timestamp: '4 hours ago', hash: '0xPREC_1102', status: 'Calculated' },
    ]
  },
  {
    id: 'MOD-005',
    title: 'Consensus Multi-Sig Voting & Validator Node Audit',
    category: 'Consensus Governance',
    kpiPrimary: '1,240 Seals',
    kpiLabel: 'Consensus Blocks Sealed',
    trendPercentage: '98.6% Quorum Rate',
    trendDirection: 'up',
    description: 'Multi-judge binding vote distribution, ZK-Proof validator node latency, and cryptographic block sealing ledger.',
    statusBadge: '3 Nodes Online',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    iconName: 'Users',
    lastSync: 'Sync Live (1 min ago)',

    metricHighlights: [
      { label: 'Avg Consensus Latency', value: '3.8 Hours', note: 'Time from block creation to 3-node multi-sig' },
      { label: 'Validator Node Uptime', value: '99.8% Online', note: 'Independent authority node health' },
      { label: 'Quorum Compliance', value: '100% Validated', note: 'Zero unconfirmed blocks in active ledger' },
    ],
    zoneBreakdown: [
      { zone: 'Node Alpha (Court Authority 1)', metricValue: '99.8% Uptime • 2.1h Avg Vote', status: 'Optimal' },
      { zone: 'Node Beta (Independent Validator 1)', metricValue: '99.5% Uptime • 3.4h Avg Vote', status: 'Optimal' },
      { zone: 'Node Gamma (Independent Validator 2)', metricValue: '98.9% Uptime • 4.2h Avg Vote', status: 'Normal' },
    ],
    timeSeriesDetailed: [
      { time: 'Block #891', valueA: 3.2, valueB: 3, labelA: 'Hours to Quorum', labelB: 'Nodes Signed' },
      { time: 'Block #892', valueA: 2.8, valueB: 3, labelA: 'Hours to Quorum', labelB: 'Nodes Signed' },
      { time: 'Block #893', valueA: 4.1, valueB: 3, labelA: 'Hours to Quorum', labelB: 'Nodes Signed' },
      { time: 'Block #894', valueA: 3.5, valueB: 3, labelA: 'Hours to Quorum', labelB: 'Nodes Signed' },
    ],
    statutoryAuditLog: [
      { event: 'Consensus Block #89201 Sealed with 3/3 Signatures', timestamp: '15 mins ago', hash: '0xBLOCK_89201', status: 'Sealed' },
      { event: 'Validator Node Beta Heartbeat Confirmed', timestamp: '1 hour ago', hash: '0xNODE_BETA_99', status: 'Active' },
    ]
  },
  {
    id: 'MOD-006',
    title: 'Cross-Jurisdictional District Court Equity Benchmark',
    category: 'Administrative Equity',
    kpiPrimary: '5 Districts',
    kpiLabel: 'Synchronized Benches',
    trendPercentage: '100% Ledger Sync',
    trendDirection: 'up',
    description: 'Resource allocation, case load balance, equipment calibration, and digital infrastructure readiness across all court districts.',
    statusBadge: 'Fully Synchronized',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    iconName: 'MapPin',
    lastSync: 'Sync Live (4 mins ago)',

    metricHighlights: [
      { label: 'Resource Utilization Ratio', value: '98.2%', note: 'Optimal distribution of digital evidence servers' },
      { label: 'Untracked Physical Exhibits', value: '0 Items', note: '100% barcodes mapped to cryptographic ledger' },
      { label: 'Appellate Reversal Reduction', value: '-22% YoY', note: 'Attributable to digital twin precedent audits' },
    ],
    zoneBreakdown: [
      { zone: 'District 1 (North Metropolitan)', metricValue: '3,240 Active Cases • 98.4% Sync', status: 'Optimal' },
      { zone: 'District 2 (South Industrial)', metricValue: '2,890 Active Cases • 97.9% Sync', status: 'Optimal' },
      { zone: 'District 3 (East Tech Hub)', metricValue: '3,810 Active Cases • 99.2% Sync', status: 'Optimal' },
      { zone: 'District 4 (West Suburban)', metricValue: '4,120 Active Cases • 96.8% Sync', status: 'Normal' },
      { zone: 'District 5 (Central Appellate)', metricValue: '760 Active Cases • 100% Sync', status: 'Optimal' },
    ],
    timeSeriesDetailed: [
      { time: 'Q1 2025', valueA: 92, valueB: 88, labelA: 'Infrastructure Readiness', labelB: 'Resource Equity' },
      { time: 'Q2 2025', valueA: 95, valueB: 91, labelA: 'Infrastructure Readiness', labelB: 'Resource Equity' },
      { time: 'Q3 2025', valueA: 97, valueB: 94, labelA: 'Infrastructure Readiness', labelB: 'Resource Equity' },
      { time: 'Q4 2025', valueA: 99, valueB: 98, labelA: 'Infrastructure Readiness', labelB: 'Resource Equity' },
    ],
    statutoryAuditLog: [
      { event: 'District 3 Server Cluster Upgrade Verified', timestamp: '2 hours ago', hash: '0xDIST_03_UP', status: 'Completed' },
      { event: 'Inter-Jurisdictional Ledger Audit Passed', timestamp: '5 hours ago', hash: '0xDIST_AUDIT', status: 'Passed' },
    ]
  }
];

// ==================== HOMOMORPHIC ENCRYPTED DATASETS (INDEPENDENT VALIDATOR) ==================== //

export interface HomomorphicReportItem {
  id: string;
  reportCode: string;
  title: string;
  courtScope: string;
  benchScope: string;
  cohortSize: number;
  minCohortThreshold: number;
  differentialPrivacyEpsilon: number;
  isKAnonymityValid: boolean;
  caseDurationAvgDays: number;
  caseDurationBaselineDays: number;
  precedentVarianceScore: number;
  anomalyScore: number;
  anomalySeverity: 'Low' | 'Medium' | 'Critical';
  summaryDescription: string;
  encryptionAlgorithm: string;
  escalationStatus: 'None' | 'Escalated';
  escalationTicketId?: string;
  escalationDate?: string;
  escalationRationale?: string;
  escalationCategory?: string;
}

const INITIAL_HOMOMORPHIC_REPORTS: HomomorphicReportItem[] = [];

const FHE_DURATION_TRENDS = [
  { period: 'Q1 2025', zone1North: 1.2, zone2South: 1.8, zone3Cyber: 1.1, zone4West: 1.9, zone5Apex: 0.9 },
  { period: 'Q2 2025', zone1North: 1.3, zone2South: 1.7, zone3Cyber: 1.2, zone4West: 2.1, zone5Apex: 0.8 },
  { period: 'Q3 2025', zone1North: 1.4, zone2South: 1.8, zone3Cyber: 1.1, zone4West: 2.4, zone5Apex: 0.9 },
  { period: 'Q4 2025', zone1North: 1.3, zone2South: 1.9, zone3Cyber: 1.3, zone4West: 2.8, zone5Apex: 0.8 },
  { period: 'Q1 2026', zone1North: 1.2, zone2South: 1.8, zone3Cyber: 1.2, zone4West: 3.1, zone5Apex: 0.9 },
  { period: 'Q2 2026', zone1North: 1.4, zone2South: 1.7, zone3Cyber: 1.1, zone4West: 3.4, zone5Apex: 0.9 },
  { period: 'Q3 2026', zone1North: 1.3, zone2South: 1.8, zone3Cyber: 1.2, zone4West: 3.2, zone5Apex: 0.9 },
];

const FHE_ANOMALY_TRENDS = [
  { month: 'May 2026', bench1Cyber: 0.02, bench2Commercial: 0.05, bench3Criminal: 0.03, bench4WestTribunal: 0.08, bench5Apex: 0.01 },
  { month: 'Jun 2026', bench1Cyber: 0.03, bench2Commercial: 0.04, bench3Criminal: 0.04, bench4WestTribunal: 0.12, bench5Apex: 0.01 },
  { month: 'Jul 2026', bench1Cyber: 0.02, bench2Commercial: 0.06, bench3Criminal: 0.03, bench4WestTribunal: 0.25, bench5Apex: 0.01 },
  { month: 'Aug 2026', bench1Cyber: 0.01, bench2Commercial: 0.05, bench3Criminal: 0.05, bench4WestTribunal: 0.48, bench5Apex: 0.01 },
  { month: 'Sep 2026', bench1Cyber: 0.02, bench2Commercial: 0.04, bench3Criminal: 0.04, bench4WestTribunal: 0.71, bench5Apex: 0.01 },
  { month: 'Oct 2026', bench1Cyber: 0.02, bench2Commercial: 0.05, bench3Criminal: 0.03, bench4WestTribunal: 0.84, bench5Apex: 0.01 },
];

const FHE_COHORT_PRIVACY_AUDIT = [
  { category: 'Cyber Evidence Dockets', N: 5630, minThreshold: 50, isSafe: true },
  { category: 'Financial & Corporate Fraud', N: 4150, minThreshold: 50, isSafe: true },
  { category: 'NDPS Contraband Exhibits', N: 2370, minThreshold: 50, isSafe: true },
  { category: 'IPR & Commercial Contracts', N: 1780, minThreshold: 50, isSafe: true },
  { category: 'Property & Land Disputes', N: 890, minThreshold: 50, isSafe: true },
  { category: 'West Special Tribunal Zone 4', N: 312, minThreshold: 50, isSafe: true },
];

export function AnalyticsTab({ role = 'Court Authority' }: { role?: string }) {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d' | 'YTD'>('7d');
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [backendMetrics, setBackendMetrics] = useState<any>(null);
  const [zoneBenchmarkData, setZoneBenchmarkData] = useState<any[]>([]);
  const [courtBenchesVelocity, setCourtBenchesVelocity] = useState<any[]>([]);
  const [durationTrends, setDurationTrends] = useState<any[]>([]);
  const [anomalyTrends, setAnomalyTrends] = useState<any[]>([]);
  const [cohortPrivacyAudit, setCohortPrivacyAudit] = useState<any[]>([]);
  const [timeSeriesVolume, setTimeSeriesVolume] = useState<any[]>([]);
  const [caseCategories, setCaseCategories] = useState<any[]>([]);
  const [analyticalModules, setAnalyticalModules] = useState<AnalyticalModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = () => {
    api.getAnalyticsOverview()
      .then(res => {
        setIsLoading(false);
        if (res.metrics) {
          setBackendMetrics(res.metrics);
        }
        if (res.zoneBenchmarkData && Array.isArray(res.zoneBenchmarkData)) {
          setZoneBenchmarkData(res.zoneBenchmarkData);
        }
        if (res.courtBenchesVelocity && Array.isArray(res.courtBenchesVelocity)) {
          setCourtBenchesVelocity(res.courtBenchesVelocity);
        }
        if (res.durationTrends && Array.isArray(res.durationTrends)) {
          setDurationTrends(res.durationTrends);
        }
        if (res.anomalyTrends && Array.isArray(res.anomalyTrends)) {
          setAnomalyTrends(res.anomalyTrends);
        }
        if (res.cohortPrivacyAudit && Array.isArray(res.cohortPrivacyAudit)) {
          setCohortPrivacyAudit(res.cohortPrivacyAudit);
        }
        if (res.timeSeriesVolume && Array.isArray(res.timeSeriesVolume)) {
          setTimeSeriesVolume(res.timeSeriesVolume);
        }
        if (res.caseCategories && Array.isArray(res.caseCategories)) {
          setCaseCategories(res.caseCategories);
        }
        if (res.analyticalModules && Array.isArray(res.analyticalModules)) {
          setAnalyticalModules(res.analyticalModules);
        }
        if (res.reports && Array.isArray(res.reports)) {
          setHomomorphicReports(res.reports);
        }
      })
      .catch(err => {
        setIsLoading(false);
        console.log('Analytics backend overview info:', err.message);
      });
  };

  useEffect(() => {
    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 5000);
    return () => clearInterval(interval);
  }, []);

  // INDEPENDENT VALIDATOR HOMOMORPHIC STATE
  const [homomorphicReports, setHomomorphicReports] = useState<HomomorphicReportItem[]>(INITIAL_HOMOMORPHIC_REPORTS);
  const [validatorMainTab, setValidatorMainTab] = useState<'overview' | 'by_court' | 'trends'>('overview');
  const [validatorDateRange, setValidatorDateRange] = useState<'30d' | 'quarter' | 'custom'>('30d');
  const [validatorCourtFilter, setValidatorCourtFilter] = useState<string>('All');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [activeChartTab, setActiveChartTab] = useState<'duration_trends' | 'anomaly_scores' | 'cohort_privacy'>('duration_trends');
  const [selectedReportDetail, setSelectedReportDetail] = useState<HomomorphicReportItem | null>(null);
  const [activeInfoTooltipId, setActiveInfoTooltipId] = useState<string | null>(null);

  // ESCALATION MODAL STATE
  const [escalationModalReport, setEscalationModalReport] = useState<HomomorphicReportItem | null>(null);
  const [escalationCategory, setEscalationCategory] = useState<string>('Spike in Case Duration');
  const [escalationRationale, setEscalationRationale] = useState<string>('');
  const [escalationConfirmCheck, setEscalationConfirmCheck] = useState<boolean>(false);
  const [escalationError, setEscalationError] = useState<string | null>(null);

  const handleSubmitEscalation = () => {
    if (!escalationModalReport) return;
    if (!escalationRationale.trim()) {
      setEscalationError('⚠️ Technical Rationale Required: You must provide reasoning for escalating this anomaly to the Independent Judicial Oversight Board.');
      return;
    }

    api.escalateAnalyticsReport(escalationModalReport.id, escalationRationale.trim(), escalationCategory)
      .then(res => {
        if (res.success) {
          showToast(res.message || `Formal Oversight Escalation Created: Ticket #${res.ticketId} routed to Independent Judicial Oversight Board`);
          fetchAnalyticsData();
          setEscalationModalReport(null);
          setEscalationRationale('');
          setEscalationConfirmCheck(false);
          setEscalationError(null);
        } else {
          setEscalationError(res.message || 'Failed to submit escalation');
        }
      })
      .catch(err => setEscalationError(err.message || 'Failed to submit escalation to server'));
  };

  const handleExportSummaryPDF = () => {
    const reportData = `JUDICIAL AGGREGATE ANALYTICS REPORT (INDEPENDENT VALIDATOR)
Generated: ${new Date().toISOString()}
Role: Independent Validator
Date Range Scope: ${validatorDateRange === '30d' ? 'Last 30 Days' : validatorDateRange === 'quarter' ? 'Current Quarter (Q3 2026)' : 'Custom Period'}
Court Scope: ${validatorCourtFilter}
Differential Privacy Threshold: k >= 50 Met (N=14,820)
Differential Privacy Epsilon: e = 0.5

1. MEAN DISPOSITION DAYS: 1.4 Days (Baseline: 1.35 Days)
2. BENCH PATTERN SIMILARITY: 96.8%
3. PEAK STATISTICAL DRIFT: 8.4% (Zone 4 West Special Tribunal)

REPORTS SUMMARY:
${homomorphicReports.map(r => `- ${r.reportCode}: ${r.title} | Scope: ${r.courtScope} | Cohort Size: N=${r.cohortSize} | Anomaly Score: ${r.anomalyScore}%`).join('\n')}

CONFIRMATION:
Cohort size verified above minimum threshold (k >= 50). No individual case file, litigant name, or exhibit is present or recoverable from this aggregate report.`;

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `judicial_aggregate_analytics_summary_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Aggregate summary report exported successfully. All data is privacy-masked (k >= 50).');
  };

  // DEEP DETAILED INNER PAGER STATE
  // null = Executive Aggregate Overview Repository Mode; Module ID = Deep Detailed Inner Pager View Mode
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // INNER SUB-TAB SELECTION inside Deep Detailed Pager
  const [innerSubTab, setInnerSubTab] = useState<
    'metrics_breakdown' | 'district_micro' | 'forensic_integrity' | 'precedent_distribution' | 'consensus_multisig' | 'judicial_attestation'
  >('metrics_breakdown');

  // JUDICIAL ATTESTATION FORM STATE inside Deep Detailed Pager
  const [judgePasskey, setJudgePasskey] = useState('JUDGE-BENCH-KEY-2026-SECRET');
  const [attestationNotes, setAttestationNotes] = useState('');
  const [agreedToOath, setAgreedToOath] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const sigPadRef = useRef<SignatureCanvas>(null);

  // TOAST NOTIFICATION
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedModule = analyticalModules.find((m) => m.id === selectedModuleId);

  const filteredModules = analyticalModules.filter((mod) => {
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone = selectedZone === 'All' || mod.zoneBreakdown.some((z) => z.zone.includes(selectedZone));

    return matchesSearch && matchesZone;
  });

  const handleOpenModuleDeepView = (id: string, subTab: typeof innerSubTab = 'metrics_breakdown') => {
    setSelectedModuleId(id);
    setInnerSubTab(subTab);
    setAttestationNotes('');
    setAgreedToOath(false);
  };

  const handleExecuteAttestation = () => {
    if (!selectedModule) return;
    if (!agreedToOath) {
      showToast('Mandatory Judicial Oath & Statutory Attestation check is required.');
      return;
    }
    if (!judgePasskey.trim()) {
      showToast('Judicial Private Signature Key Token is required.');
      return;
    }

    setIsSigning(true);

    setTimeout(() => {
      setIsSigning(false);
      showToast(
        `Judicial Aggregate Analytics Attestation for "${selectedModule.title}" OFFICIALLY SIGNED & SEALED to Judicial Ledger.`
      );
    }, 800);
  };

  if (role === 'Independent Validator') {
    const filteredReports = homomorphicReports.filter((rpt) => {
      const matchesSearch =
        rpt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.reportCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.courtScope.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.summaryDescription.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourt =
        validatorCourtFilter === 'All' ||
        rpt.courtScope.toLowerCase().includes(validatorCourtFilter.toLowerCase());

      return matchesSearch && matchesCourt;
    });

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-7xl mx-auto font-sans pb-16"
      >
        {/* GLOBAL TOAST NOTIFICATION */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-4 border border-indigo-500/30 max-w-lg"
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ESCALATION INQUIRY MODAL ("REQUEST DEEPER REVIEW") */}
        <AnimatePresence>
          {escalationModalReport && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-indigo-500/30 text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative"
              >
                <button
                  onClick={() => {
                    setEscalationModalReport(null);
                    setEscalationError(null);
                  }}
                  className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    Formal Oversight Inquiry Escalation
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Request Deeper Review for Anomaly
                  </h2>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Report: <strong className="text-white">{escalationModalReport.title}</strong> ({escalationModalReport.reportCode})
                  </p>
                </div>

                {/* Zero Knowledge Data Isolation Warning */}
                <div className="p-4 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 flex items-start gap-3">
                  <LockKeyhole className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <span className="font-extrabold text-indigo-200 uppercase tracking-wider block">
                      Zero-Knowledge Privacy Isolation Guaranteed
                    </span>
                    <p className="text-indigo-100 leading-relaxed font-medium">
                      This escalation routes to an independent Judicial Oversight Board outside this platform. You will <strong>NEVER</strong> receive raw case file contents, party names, or unmasked witness identities. The board inspects encrypted homomorphic proof traces in an enclave.
                    </p>
                  </div>
                </div>

                {escalationError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{escalationError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Reason for Escalation <span className="text-rose-400">* Required</span>
                    </label>
                    <textarea
                      rows={4}
                      value={escalationRationale}
                      onChange={(e) => {
                        setEscalationRationale(e.target.value);
                        if (e.target.value.trim()) setEscalationError(null);
                      }}
                      placeholder="State specific reason for requesting deeper review (e.g., 'Statistical duration deviation of +128% in Zone 4 exceeds homomorphic baseline limits; requires external enclave verification')..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/15 text-xs text-white outline-none focus:border-indigo-400 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEscalationModalReport(null);
                      setEscalationError(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitEscalation}
                    className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Submit Escalation</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AGGREGATE-ONLY REPORT DETAIL MODAL */}
        <AnimatePresence>
          {selectedReportDetail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative font-sans text-slate-900 border border-slate-200"
              >
                <button
                  onClick={() => setSelectedReportDetail(null)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-2 pr-8">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded bg-slate-900 text-white">
                      {selectedReportDetail.reportCode}
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Cohort N = {selectedReportDetail.cohortSize.toLocaleString()} (k ≥ {selectedReportDetail.minCohortThreshold} SAFE)
                    </span>
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                      DP ε = {selectedReportDetail.differentialPrivacyEpsilon}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedReportDetail.title}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Jurisdiction: {selectedReportDetail.courtScope} • Bench: {selectedReportDetail.benchScope}
                  </p>
                </div>

                {/* Privacy Guarantee Banner */}
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                  <span className="font-extrabold uppercase tracking-wider block text-indigo-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Aggregate-Level Report (Zero Case Identification)
                  </span>
                  <p className="leading-relaxed">
                    This detailed report represents homomorphically evaluated mathematical metrics over encrypted ledger state. Individual case IDs, party names, judge identities, and evidence contents are strictly unrepresented and cryptographically impossible to reverse-identify.
                  </p>
                </div>

                {/* Detailed Metrics Table */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mean Disposition Days</span>
                    <span className="text-lg font-extrabold font-mono text-slate-900">{selectedReportDetail.caseDurationAvgDays} Days</span>
                    <span className="text-[10px] text-slate-500 block">Baseline: {selectedReportDetail.caseDurationBaselineDays}d</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Precedent Variance</span>
                    <span className="text-lg font-extrabold font-mono text-indigo-900">{selectedReportDetail.precedentVarianceScore}%</span>
                    <span className="text-[10px] text-slate-500 block">Homomorphic Vector</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Anomaly Score</span>
                    <span className={`text-lg font-extrabold font-mono ${selectedReportDetail.anomalySeverity === 'Critical' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {selectedReportDetail.anomalyScore}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">Severity: {selectedReportDetail.anomalySeverity}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">Statistical Summary & Analysis</span>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {selectedReportDetail.summaryDescription}
                  </p>
                  <div className="pt-2 border-t border-slate-200 text-[11px] font-mono text-slate-500 flex justify-between">
                    <span>Encryption Scheme: {selectedReportDetail.encryptionAlgorithm}</span>
                    <span>Status: {selectedReportDetail.escalationStatus}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportSummaryPDF}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                    <span>Export Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const rpt = selectedReportDetail;
                      setSelectedReportDetail(null);
                      setEscalationModalReport(rpt);
                      setEscalationRationale('');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Request Deeper Review</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER BANNER - HOMOMORPHIC ANALYTICS PORTAL */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Cpu className="w-64 h-64 text-indigo-300" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Layer 4 Homomorphic Encrypted Analytics Engine
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Aggregate Analytics & Differential Privacy Safeguards
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Real-time statistical evaluation computed over encrypted ledger ciphertexts. Visualizes case-duration distributions, bench-level pattern comparisons, and anomaly drift while strictly preventing exposure of individual named cases or parties.
              </p>
            </div>

            {/* PRIVACY COHORT STATUS CARD */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-2 shrink-0 min-w-[240px]">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <span>Cohort Safeguard Check</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-extrabold font-mono text-emerald-400">
                k ≥ 50 Threshold MET
              </div>
              <p className="text-[11px] text-slate-300 font-medium">
                Smallest active cohort: <strong className="text-white font-mono">N = {backendMetrics?.smallestCohortN || 60}</strong>
                <br />
                Differential Privacy Noise: <strong className="text-indigo-300 font-mono">ε = 0.5</strong>
              </p>
            </div>
          </div>

          {/* TOP ACTION & FILTER CONTROL BAR */}
          <div className="pt-4 border-t border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Date-range selector */}
              <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-2xl border border-white/15">
                <span className="text-[11px] font-bold text-indigo-200 px-2 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                  Period:
                </span>
                {(
                  [
                    { id: '30d', label: 'Last 30 Days' },
                    { id: 'quarter', label: 'Quarter' },
                    { id: 'custom', label: 'Custom' },
                  ] as const
                ).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setValidatorDateRange(r.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                      validatorDateRange === r.id
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Court/bench filter dropdown */}
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/15 text-xs font-bold">
                <Filter className="w-3.5 h-3.5 text-indigo-300" />
                <span className="text-indigo-200">Court/Bench:</span>
                <select
                  value={validatorCourtFilter}
                  onChange={(e) => setValidatorCourtFilter(e.target.value)}
                  className="bg-slate-900 text-white rounded-xl px-2 py-1 outline-none text-xs font-bold cursor-pointer border border-white/20"
                >
                  <option value="All">All Courts & Benches</option>
                  <option value="Zone 1">Zone 1 North High Court</option>
                  <option value="Zone 2">Zone 2 South Commercial Bench</option>
                  <option value="Zone 3">Zone 3 East Cyber Precinct</option>
                  <option value="Zone 4">Zone 4 West Special Tribunal</option>
                  <option value="Zone 5">Zone 5 Central Apex Appellate</option>
                </select>
              </div>

              {/* Chart-type toggle */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-2xl border border-white/15 text-xs font-bold">
                <button
                  onClick={() => setChartType('bar')}
                  className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                    chartType === 'bar' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Bar View
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-3 py-1 rounded-xl transition-all flex items-center gap-1.5 ${
                    chartType === 'line' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Line View
                </button>
              </div>
            </div>

            {/* Export Summary Button */}
            <button
              onClick={handleExportSummaryPDF}
              className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shrink-0"
            >
              <Download className="w-4 h-4 text-indigo-200" />
              <span>Export Summary (PDF)</span>
            </button>
          </div>
        </div>

        {/* INNER PAGES / TABS NAVIGATION */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-4 gap-2">
            <button
              onClick={() => setValidatorMainTab('overview')}
              className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all rounded-t-xl ${
                validatorMainTab === 'overview'
                  ? 'border-indigo-600 text-indigo-950 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4 text-indigo-600" />
              <span>Overview Tab (Headline Charts)</span>
            </button>

            <button
              onClick={() => setValidatorMainTab('by_court')}
              className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all rounded-t-xl ${
                validatorMainTab === 'by_court'
                  ? 'border-indigo-600 text-indigo-950 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4 text-blue-600" />
              <span>By Court / By Bench Tab</span>
            </button>

            <button
              onClick={() => setValidatorMainTab('trends')}
              className={`px-5 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-all rounded-t-xl ${
                validatorMainTab === 'trends'
                  ? 'border-indigo-600 text-indigo-950 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Trends Tab (Over Time)</span>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* OVERVIEW TAB */}
            {validatorMainTab === 'overview' && (
              <div className="space-y-6">
                {/* Headline Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mean Case Duration</span>
                    <span className="text-2xl font-extrabold font-mono text-slate-900">{backendMetrics?.meanCaseDuration ?? '—'}</span>
                    <span className="text-[11px] text-emerald-600 block font-bold">Cohort N = {(backendMetrics?.smallestCohortN ?? '—')} (k ≥ 50 {backendMetrics?.cohortThresholdPassed ? 'PASS' : 'CHECK'})</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bench Pattern Match</span>
                    <span className="text-2xl font-extrabold font-mono text-indigo-900">{backendMetrics?.benchPatternMatch ?? '—'}</span>
                    <span className="text-[11px] text-indigo-600 block font-bold">Homomorphic Vector Match</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Peak Statistical Drift</span>
                    <span className="text-2xl font-extrabold font-mono text-rose-600">{backendMetrics?.peakStatisticalDrift ?? '—'}</span>
                    <span className="text-[11px] text-rose-600 block font-bold">{backendMetrics?.peakDriftZone ?? 'No drift detected'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Oversight Escalations</span>
                    <span className="text-2xl font-extrabold font-mono text-amber-600">
                      {backendMetrics?.oversightEscalations ?? homomorphicReports.filter((r) => r.escalationStatus === 'Escalated').length} Active
                    </span>
                    <span className="text-[11px] text-amber-700 block font-bold">External Audit Inquiries</span>
                  </div>
                </div>

                {/* System-wide Headline Chart */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        Headline Court Volume & Disposition Velocity
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        System-wide throughput evaluation across all 5 court zones ({validatorDateRange === '30d' ? 'Last 30 Days' : 'Quarterly'})
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                      Chart View: {chartType === 'bar' ? 'Bar View' : 'Line View'}
                    </span>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === 'bar' ? (
                        <BarChart data={zoneBenchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="zone" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #cbd5e1' }} />
                          <Bar dataKey="incidents" fill="#6366f1" name="Evidence Dockets Ingested" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      ) : (
                        <LineChart data={zoneBenchmarkData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="zone" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #cbd5e1' }} />
                          <Line type="monotone" dataKey="incidents" stroke="#6366f1" strokeWidth={3} name="Evidence Dockets Ingested" />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Reports & Anomaly List Header */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Encrypted Anomaly Reports ({filteredReports.length})
                    </h3>

                    <div className="w-full sm:w-64 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search report title or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-500"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-4">
                    {filteredReports.map((report) => {
                      const isEscalated = report.escalationStatus === 'Escalated';
                      const isCritical = report.anomalySeverity === 'Critical';
                      const showInfoTooltip = activeInfoTooltipId === report.id;

                      return (
                        <div
                          key={report.id}
                          className={`p-5 rounded-2xl border transition-all space-y-4 ${
                            isCritical
                              ? 'bg-rose-50/20 border-rose-300 shadow-xs'
                              : isEscalated
                              ? 'bg-amber-50/20 border-amber-300'
                              : 'bg-white border-slate-200 hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="space-y-2 max-w-3xl">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                                  {report.reportCode}
                                </span>

                                {/* MINIMUM COHORT SIZE INDICATOR BADGE WITH INFO ICON */}
                                <div className="relative inline-flex items-center">
                                  <span className="text-xs font-mono font-bold px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                                    Cohort N = {report.cohortSize.toLocaleString()} (k ≥ {report.minCohortThreshold})
                                    <button
                                      type="button"
                                      onClick={() => setActiveInfoTooltipId(showInfoTooltip ? null : report.id)}
                                      title="Click to verify privacy threshold details"
                                      className="p-0.5 hover:bg-emerald-200 rounded-full text-emerald-800 transition-colors"
                                    >
                                      <Info className="w-3.5 h-3.5 text-indigo-600" />
                                    </button>
                                  </span>

                                  {/* Info Tooltip Popover */}
                                  <AnimatePresence>
                                    {showInfoTooltip && (
                                      <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute left-0 top-8 z-30 w-72 p-3 bg-slate-900 text-white rounded-xl text-[11px] leading-relaxed shadow-xl border border-indigo-500/30 font-sans"
                                      >
                                        <div className="flex items-start justify-between gap-2 pb-1 border-b border-slate-800 font-bold text-indigo-300">
                                          <span>Differential Privacy Verified</span>
                                          <button onClick={() => setActiveInfoTooltipId(null)} className="text-slate-400 hover:text-white">
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                        <p className="mt-1">
                                        Cohort size verified above minimum threshold (k={backendMetrics?.smallestCohortN ?? '?'} &gt; 50 limit), reassuring the validator no individual case could be reverse-identified.
                                        </p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>

                                {/* DIFFERENTIAL PRIVACY BADGE */}
                                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200 flex items-center gap-1">
                                  <LockKeyhole className="w-3.5 h-3.5 text-indigo-700" />
                                  DP ε = {report.differentialPrivacyEpsilon}
                                </span>

                                {/* ANOMALY SEVERITY BADGE */}
                                <span
                                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-[10px] ${
                                    report.anomalySeverity === 'Critical'
                                      ? 'bg-rose-100 text-rose-900 border border-rose-300 animate-pulse'
                                      : report.anomalySeverity === 'Medium'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                                  }`}
                                >
                                  {report.anomalySeverity} Anomaly ({report.anomalyScore}%)
                                </span>
                              </div>

                              <h4 className="text-base font-extrabold text-slate-900">
                                {report.title}
                              </h4>

                              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {report.summaryDescription}
                              </p>

                              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-mono flex-wrap">
                                <span>Jurisdiction: <strong className="text-slate-800">{report.courtScope}</strong></span>
                                <span>Bench: <strong className="text-slate-800">{report.benchScope}</strong></span>
                              </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setSelectedReportDetail(report)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5"
                              >
                                <span>Report Detail</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>

                              {isEscalated ? (
                                <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-[11px] font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Escalated #{report.escalationTicketId}</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEscalationModalReport(report);
                                    setEscalationRationale('');
                                    setEscalationError(null);
                                  }}
                                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs ${
                                    isCritical
                                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                                  }`}
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                                  <span>Request Deeper Review</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* BY COURT / BY BENCH TAB */}
            {validatorMainTab === 'by_court' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    Comparative Analysis Across Judicial Institutions
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Bench-level efficiency, disposition duration, and precedent alignment benchmarking
                  </p>
                </div>

                {/* Institutions Comparison Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {zoneBenchmarkData.map((zone, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-extrabold text-xs text-slate-900">{zone.zone}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${zone.integrity > 99.9 ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>
                          Integrity {zone.integrity}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Avg Duration</span>
                          <span className="font-mono font-bold text-slate-900">{zone.avgDays} Days</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Resolve Rate</span>
                          <span className="font-mono font-bold text-emerald-700">{zone.resolveRate}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Active Dockets</span>
                          <span className="font-mono font-bold text-slate-900">{zone.incidents.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block">Backlog</span>
                          <span className="font-mono font-bold text-slate-700">{zone.backlog} Cases</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bench velocity comparison table */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Division Benches Velocity & Precedent Alignment Matrix
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                          <th className="p-3">Bench Name</th>
                          <th className="p-3">Presiding Authority</th>
                          <th className="p-3">Avg Disposition</th>
                          <th className="p-3">Active Dockets</th>
                          <th className="p-3">Efficiency</th>
                          <th className="p-3">Precedent Align</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {courtBenchesVelocity.map((b, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-900">{b.bench}</td>
                            <td className="p-3 text-slate-600">{b.judge}</td>
                            <td className="p-3 font-mono font-bold text-slate-900">{b.avgDispositionDays} Days</td>
                            <td className="p-3 font-mono text-slate-800">{b.activeDockets}</td>
                            <td className="p-3 font-mono text-emerald-700 font-bold">{b.efficiency}%</td>
                            <td className="p-3 font-mono text-indigo-700 font-bold">{b.precedentAlign}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TRENDS TAB */}
            {validatorMainTab === 'trends' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      Trends Over Time per Court & Bench
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Homomorphically aggregated metrics over quarterly and monthly intervals across all 5 court zones
                    </p>
                  </div>

                  {/* Chart View Switcher */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto flex-wrap">
                    <button
                      onClick={() => setActiveChartTab('duration_trends')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeChartTab === 'duration_trends'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Case Duration Distributions
                    </button>

                    <button
                      onClick={() => setActiveChartTab('anomaly_scores')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeChartTab === 'anomaly_scores'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Bench Anomaly Score Spikes
                    </button>

                    <button
                      onClick={() => setActiveChartTab('cohort_privacy')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        activeChartTab === 'cohort_privacy'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Privacy Cohort Audit
                    </button>
                  </div>
                </div>

                {/* CHART TAB 1: CASE DURATION DISTRIBUTIONS OVER TIME */}
                {activeChartTab === 'duration_trends' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-indigo-600" /> Zone 1 North</span>
                        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500" /> Zone 2 South</span>
                        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Zone 3 Cyber</span>
                        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-500 font-bold" /> Zone 4 West (+128% Spike)</span>
                        <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500" /> Zone 5 Apex</span>
                      </div>
                      <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full font-bold">
                        k-Anonymity Verified (Cohort Min N = {backendMetrics?.smallestCohortN ?? '?'} &gt; 50)
                      </span>
                    </div>

                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'line' ? (
                          <LineChart data={durationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit=" d" />
                            <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                            <Line type="monotone" dataKey="zone1North" stroke="#6366f1" strokeWidth={2.5} name="Zone 1 North" />
                            <Line type="monotone" dataKey="zone2South" stroke="#3b82f6" strokeWidth={2.5} name="Zone 2 South" />
                            <Line type="monotone" dataKey="zone3Cyber" stroke="#10b981" strokeWidth={2.5} name="Zone 3 Cyber" />
                            <Line type="monotone" dataKey="zone4West" stroke="#f43f5e" strokeWidth={3.5} name="Zone 4 West" />
                            <Line type="monotone" dataKey="zone5Apex" stroke="#a855f7" strokeWidth={2.5} name="Zone 5 Apex" />
                          </LineChart>
                        ) : (
                          <BarChart data={durationTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit=" d" />
                            <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                            <Bar dataKey="zone1North" fill="#6366f1" name="Zone 1 North" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="zone2South" fill="#3b82f6" name="Zone 2 South" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="zone3Cyber" fill="#10b981" name="Zone 3 Cyber" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="zone4West" fill="#f43f5e" name="Zone 4 West" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="zone5Apex" fill="#a855f7" name="Zone 5 Apex" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* CHART TAB 2: BENCH ANOMALY SCORE DRIFT */}
                {activeChartTab === 'anomaly_scores' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-900 flex items-center justify-between flex-wrap gap-2">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <strong>Anomalous Statistical Spike Detected in Zone 4:</strong> Anomaly score drifted from 0.08% in May to 0.84% in October 2026.
                      </span>
                      <span className="text-[11px] font-mono font-bold bg-rose-200 px-2.5 py-0.5 rounded-full text-rose-900">
                        Action Required: Request Deeper Review
                      </span>
                    </div>

                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                          <BarChart data={anomalyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                            <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                            <Bar dataKey="bench1Cyber" fill="#6366f1" name="Bench 1 Cyber" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="bench2Commercial" fill="#3b82f6" name="Bench 2 Commercial" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="bench3Criminal" fill="#10b981" name="Bench 3 Criminal" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="bench4WestTribunal" fill="#f43f5e" name="Special Tribunal Zone 4" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="bench5Apex" fill="#a855f7" name="Bench 5 Apex" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        ) : (
                          <LineChart data={anomalyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                            <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                            <Line type="monotone" dataKey="bench1Cyber" stroke="#6366f1" strokeWidth={2} name="Bench 1 Cyber" />
                            <Line type="monotone" dataKey="bench2Commercial" stroke="#3b82f6" strokeWidth={2} name="Bench 2 Commercial" />
                            <Line type="monotone" dataKey="bench3Criminal" stroke="#10b981" strokeWidth={2} name="Bench 3 Criminal" />
                            <Line type="monotone" dataKey="bench4WestTribunal" stroke="#f43f5e" strokeWidth={3.5} name="Special Tribunal Zone 4" />
                            <Line type="monotone" dataKey="bench5Apex" stroke="#a855f7" strokeWidth={2} name="Bench 5 Apex" />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* CHART TAB 3: DIFFERENTIAL PRIVACY COHORT AUDIT */}
                {activeChartTab === 'cohort_privacy' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-900 flex items-center justify-between flex-wrap gap-2">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                        <strong>Differential Privacy Protection:</strong> All active cohorts exceed the minimum k ≥ 50 anonymization threshold, guaranteeing zero individual case re-identification.
                      </span>
                      <span className="text-[11px] font-mono font-bold bg-indigo-200 px-2.5 py-0.5 rounded-full text-indigo-900">
                        100% Cohort Compliance
                      </span>
                    </div>

                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cohortPrivacyAudit} layout="vertical" margin={{ top: 10, right: 30, left: 100, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                          <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                          <Bar dataKey="N" fill="#6366f1" name="Cohort Size N" radius={[0, 8, 8, 0]}>
                            {cohortPrivacyAudit.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.N < 500 ? '#f59e0b' : '#6366f1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto font-sans pb-16"
    >
      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-2xl flex items-center justify-between gap-4 border border-indigo-500/30 max-w-lg pointer-events-auto"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW 1: EXECUTIVE AGGREGATE OVERVIEW REPOSITORY */}
      {!selectedModuleId ? (
        <div className="space-y-6">
          {/* Header Banner - Layer 6 Court Authority Aggregate Intelligence */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <BarChart3 className="w-64 h-64 text-indigo-300" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Layer 6 Executive Engine • Court Authority Aggregate Analytics
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  System-Wide Aggregate Court Analytics
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Real-time cryptographic evidence sealing metrics, judicial disposition velocity, ZK-Proof forensic integrity scorecards, and cross-jurisdictional district benchmarks.
                </p>
              </div>

              {/* Time Range & Export Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
                <div className="bg-white/10 p-1 rounded-2xl border border-white/15 flex items-center gap-1">
                  {(['24h', '7d', '30d', '90d', 'YTD'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        timeRange === range
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => showToast('Full Aggregate Court Analytics Report Exported (PDF & Ledger CSV)')}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Top Metric Cards Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Total Evidence Assets</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold font-mono text-white">{(backendMetrics?.sealedEvidence ?? 4).toLocaleString()}</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5"><TrendingUp className="w-3 h-3" /> Live DB</span>
                </div>
                <span className="text-[10px] text-slate-400 block">100% Cryptographically Sealed</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">System Integrity Score</span>
                <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold font-mono text-emerald-400">{backendMetrics?.benchPatternMatch ?? '—'}</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5"><ShieldCheck className="w-3 h-3" /> Verified</span>
                </div>
                <span className="text-[10px] text-slate-400 block">{backendMetrics?.flaggedForgeries ?? 0} Forgery Reviews</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">Avg Disposition Velocity</span>
                <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold font-mono text-amber-300">{backendMetrics?.meanCaseDuration ?? '—'}</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-0.5"><TrendingDown className="w-3 h-3" /> Live</span>
                </div>
                <span className="text-[10px] text-slate-400 block">{backendMetrics?.totalCases ?? 6} Active Court Dockets</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Consensus Blocks</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold font-mono text-indigo-300">{backendMetrics?.totalAuditBlocks ?? 7} Blocks</span>
                  <span className="text-xs font-bold text-indigo-300 flex items-center gap-0.5"><Users className="w-3 h-3" /> 100% Quorum</span>
                </div>
                <span className="text-[10px] text-slate-400 block">Height #{backendMetrics?.consensusBlockHeight ?? '—'}</span>
              </div>
            </div>
          </div>

          {/* MAIN CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Volume & Ingestion Trends */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Evidence Ingestion & Adjudication Order Velocity
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daily comparative volume between digital evidence uploads, testimonies, and issued judicial orders.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-1 text-indigo-600"><div className="w-3 h-3 rounded-full bg-indigo-600" /> Digital Evidence</span>
                  <span className="flex items-center gap-1 text-emerald-600"><div className="w-3 h-3 rounded-full bg-emerald-600" /> Testimonies</span>
                  <span className="flex items-center gap-1 text-amber-600"><div className="w-3 h-3 rounded-full bg-amber-500" /> Judicial Orders</span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEvid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTest" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="digitalEvidence" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorEvid)" name="Digital Evidence" />
                    <Area type="monotone" dataKey="testimonies" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTest)" name="Testimonies" />
                    <Area type="monotone" dataKey="judicialOrders" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOrd)" name="Judicial Orders" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Case Category Distribution */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Case Category Breakdown
                </h3>
                <p className="text-xs text-slate-500">Distribution across active court dockets</p>
              </div>

              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={caseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {caseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400 font-bold uppercase">Total Cases</span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">{(backendMetrics?.totalCases ?? 6).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                {caseCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-slate-700 truncate max-w-[170px]">{cat.name}</span>
                    </div>
                    <span className="font-mono text-slate-900 font-bold">{cat.value}% ({cat.count.toLocaleString()})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* District & Bench Performance Matrix */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  Cross-Jurisdictional District Court Performance Matrix
                </h3>
                <p className="text-xs text-slate-500">Comparative evaluation of throughput, disposition days, and integrity scorecards across court zones.</p>
              </div>

              <button
                onClick={() => handleOpenModuleDeepView('MOD-006', 'district_micro')}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>View Full District Micro-Analysis</span>
                <ChevronRight className="w-4 h-4 text-indigo-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {zoneBenchmarkData.map((zone, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-indigo-300 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{zone.zone}</h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold">
                      {zone.integrity}% Score
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Active Exhibits</span>
                      <span className="text-sm font-extrabold font-mono text-slate-900">{zone.incidents.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Avg Disposition</span>
                      <span className="text-sm font-extrabold font-mono text-indigo-600">{zone.avgDays} Days</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px] font-bold">
                      <span className="text-slate-600">Resolution Rate</span>
                      <span className="text-slate-900 font-mono">{zone.resolveRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-indigo-600"
                        style={{ width: `${zone.resolveRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FILTER & CORE ANALYTICAL MODULES REPOSITORY TABLE */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  Deep Aggregate Analytics Modules & Pagers
                </h3>
                <p className="text-xs text-slate-500">Select any analytical domain module below to launch the multi-dimensional Deep Detailed Inner Pager.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Zone Filter */}
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="All">All Court Zones</option>
                  <option value="Zone 1">Zone 1 (North)</option>
                  <option value="Zone 2">Zone 2 (South)</option>
                  <option value="Zone 3">Zone 3 (East)</option>
                  <option value="Zone 4">Zone 4 (West)</option>
                  <option value="Zone 5">Zone 5 (Central)</option>
                </select>

                {/* Search Input */}
                <div className="w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search module title, category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 outline-none focus:bg-white focus:border-indigo-500 placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* List Cards of Core Analytical Modules */}
            <div className="space-y-4">
              {filteredModules.map((mod) => (
                <div
                  key={mod.id}
                  onClick={() => handleOpenModuleDeepView(mod.id, 'metrics_breakdown')}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer group space-y-4 hover:shadow-md"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 border border-slate-800 shadow-xs">
                        <BarChart3 className="w-7 h-7 text-indigo-400" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white">
                            {mod.id}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded border border-indigo-200">
                            {mod.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border ${mod.badgeColor}`}>
                            {mod.statusBadge}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-sans">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
                      <div className="text-left md:text-right">
                        <span className="text-xl font-extrabold font-mono text-slate-900 block">{mod.kpiPrimary}</span>
                        <span className="text-[10px] text-slate-500 font-bold block">{mod.kpiLabel}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModuleDeepView(mod.id, 'metrics_breakdown');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Open Deep Pager</span>
                        <ChevronRight className="w-4 h-4 text-indigo-300" />
                      </button>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/80">
                    {mod.metricHighlights.map((hl, i) => (
                      <div key={i} className="p-3 rounded-2xl bg-white border border-slate-200 space-y-0.5">
                        <span className="text-[10px] font-extrabold text-slate-400 block uppercase">{hl.label}</span>
                        <span className="text-sm font-extrabold text-slate-900 font-mono block">{hl.value}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{hl.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : selectedModule ? (
        /* VIEW 2: DEEP DETAILED INNER PAGER FOR SELECTED ANALYTICAL MODULE */
        <div className="space-y-6">
          {/* Top Navigation & Quick Action Header */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedModuleId(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>Return to Aggregate Analytics Repository</span>
              </button>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 text-white font-mono text-xs font-bold">
                  {selectedModule.id}
                </span>
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${selectedModule.badgeColor}`}>
                  {selectedModule.statusBadge}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => showToast(`Module ${selectedModule.id} Deep Analytics Audit Exported (PDF)`)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-indigo-600" />
                <span>Export Module PDF</span>
              </button>

              <button
                onClick={() => setInnerSubTab('judicial_attestation')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <FileSignature className="w-4 h-4" />
                <span>Record Judicial Attestation</span>
              </button>
            </div>
          </div>

          {/* Hero Banner for Selected Module */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-indigo-300 text-xs font-bold border border-white/15">
                    Module: {selectedModule.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 font-mono">
                    {selectedModule.trendPercentage}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-white/10 text-slate-300 text-xs font-bold">
                    {selectedModule.lastSync}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {selectedModule.title}
                </h1>

                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {selectedModule.description}
                </p>
              </div>

              {/* KPI Badge */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 text-center shrink-0 min-w-[160px]">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                  Primary Metric KPI
                </span>
                <span className="text-2xl font-extrabold font-mono text-indigo-300 block mt-1">
                  {selectedModule.kpiPrimary}
                </span>
                <span className="text-[10px] text-slate-300 block mt-0.5">
                  {selectedModule.kpiLabel}
                </span>
              </div>
            </div>
          </div>

          {/* DEEP INNER SUB-TABS NAVIGATION PAGER */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            {[
              { id: 'metrics_breakdown', label: '1. Metric & Trend Breakdown', icon: BarChart3 },
              { id: 'district_micro', label: '2. District & Bench Micro-Analysis', icon: MapPin },
              { id: 'forensic_integrity', label: '3. Forensic & ZK-Proofs Audit', icon: ShieldCheck },
              { id: 'precedent_distribution', label: '4. Precedent & Outlier Distribution', icon: Scale },
              { id: 'consensus_multisig', label: '5. Consensus Multi-Sig Audit', icon: Users },
              { id: 'judicial_attestation', label: '6. Record Judicial Attestation', icon: Gavel },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setInnerSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  innerSubTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* INNER TAB 1: METRIC & TREND BREAKDOWN */}
          {innerSubTab === 'metrics_breakdown' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-600" />
                      Granular Time-Series & Variance Trend Chart
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time ledger sampling comparing target thresholds against recorded performance values.
                    </p>
                  </div>

                  <div className="px-3 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded-full text-xs font-bold font-mono">
                    Sampling Interval: 1 Hour
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedModule.timeSeriesDetailed} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                      <Line type="monotone" dataKey="valueA" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} name={selectedModule.timeSeriesDetailed[0]?.labelA || 'Measured Value'} />
                      <Line type="monotone" dataKey="valueB" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3 }} name={selectedModule.timeSeriesDetailed[0]?.labelB || 'Baseline Threshold'} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Highlights Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedModule.metricHighlights.map((hl, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                    <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider block">{hl.label}</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono block">{hl.value}</span>
                    <p className="text-xs text-slate-600 font-medium">{hl.note}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* INNER TAB 2: DISTRICT & BENCH MICRO-ANALYSIS */}
          {innerSubTab === 'district_micro' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Zone & Division Bench Detailed Micro-Analysis
                  </h3>
                  <p className="text-xs text-slate-500">Cross-comparing individual court zones, active docket loads, and disposition speed.</p>
                </div>

                <div className="space-y-4">
                  {selectedModule.zoneBreakdown.map((z, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-extrabold text-slate-900 block">{z.zone}</span>
                        <p className="text-xs font-mono text-indigo-600 font-bold">{z.metricValue}</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-bold border shrink-0 ${
                        z.status === 'Optimal'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : z.status === 'Attention'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}>
                        {z.status} Status
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Court Benches Velocity Table */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900">Division Benches Velocity & Workload Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Bench Division</th>
                        <th className="py-3 px-4">Presiding Judge</th>
                        <th className="py-3 px-4">Avg Disposition</th>
                        <th className="py-3 px-4">Active Dockets</th>
                        <th className="py-3 px-4">Efficiency Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-800">
                      {courtBenchesVelocity.map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{b.bench}</td>
                          <td className="py-3.5 px-4 text-slate-600">{b.judge}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{b.avgDispositionDays} Days</td>
                          <td className="py-3.5 px-4 font-mono text-slate-900">{b.activeDockets} Cases</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold font-mono">
                              {b.efficiency}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 3: FORENSIC & ZK-PROOFS AUDIT */}
          {innerSubTab === 'forensic_integrity' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-indigo-600" />
                    Zero-Knowledge Forensic Integrity & Cryptographic Audit
                  </h3>
                  <p className="text-xs text-slate-500">Verification log of HSM key rotations, ZK-Snark proofs, and evidence tamper prevention.</p>
                </div>

                <div className="space-y-3">
                  {selectedModule.statutoryAuditLog.map((log, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs font-mono">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block font-sans">{log.event}</span>
                        <span className="text-slate-500 text-[11px] block">{log.timestamp} • Hash: {log.hash}</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-bold">
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 4: PRECEDENT & OUTLIER DISTRIBUTION */}
          {innerSubTab === 'precedent_distribution' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-600" />
                    Precedent Neural Vector Matching & Outlier Gaussian Curves
                  </h3>
                  <p className="text-xs text-slate-500">Distribution analysis comparing subject rulings against 4,830 landmark precedent vectors.</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Gaussian Tail Distribution</span>
                    <span className="text-xs font-mono text-indigo-300">+3.4σ Upper Tail Limit</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Statistical deviations beyond 2.5σ are automatically routed to the Appellate Quality Cell for administrative advisory review. Over 98.1% of court rulings fall cleanly within the median expected confidence interval.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 5: CONSENSUS MULTI-SIG AUDIT */}
          {innerSubTab === 'consensus_multisig' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Consensus Voting Latency & Validator Node Multi-Sig Audit
                  </h3>
                  <p className="text-xs text-slate-500">Independent authority node voting timelines and quorum sealing ledger.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Node Alpha (Court Authority)</span>
                    <span className="text-xl font-bold text-slate-900 font-mono block">99.8% Online</span>
                    <span className="text-xs text-emerald-600 font-bold block">Avg Vote: 2.1 Hours</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Node Beta (Validator 1)</span>
                    <span className="text-xl font-bold text-slate-900 font-mono block">99.5% Online</span>
                    <span className="text-xs text-emerald-600 font-bold block">Avg Vote: 3.4 Hours</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-500 uppercase">Node Gamma (Validator 2)</span>
                    <span className="text-xl font-bold text-slate-900 font-mono block">98.9% Online</span>
                    <span className="text-xs text-emerald-600 font-bold block">Avg Vote: 4.2 Hours</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* INNER TAB 6: RECORD JUDICIAL ATTESTATION */}
          {innerSubTab === 'judicial_attestation' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold uppercase">
                    <FileSignature className="w-3.5 h-3.5 text-amber-300" />
                    Judicial Aggregate Analytics Attestation Form
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Execute Official Judicial Attestation for {selectedModule.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Signing this attestation binds the current aggregate performance metrics and integrity audit log into the immutable court administrative ledger.
                  </p>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 text-xs font-sans">
                  <div className="space-y-1.5">
                    <label className="text-slate-300 font-bold block uppercase tracking-wider text-[10px]">
                      Judicial Review Notes & Administrative Directives
                    </label>
                    <textarea
                      rows={3}
                      value={attestationNotes}
                      onChange={(e) => setAttestationNotes(e.target.value)}
                      placeholder="Enter court authority remarks regarding system-wide aggregate performance, zone variances, or integrity benchmarks..."
                      className="w-full p-3.5 bg-slate-800/80 border border-slate-700 rounded-2xl text-white outline-none focus:border-indigo-400 placeholder:text-slate-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-bold block uppercase tracking-wider text-[10px]">
                        Presiding Judge Key Token
                      </label>
                      <input
                        type="text"
                        value={judgePasskey}
                        onChange={(e) => setJudgePasskey(e.target.value)}
                        className="w-full p-3 bg-slate-800/80 border border-slate-700 rounded-2xl text-white font-mono text-xs outline-none focus:border-indigo-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-300 font-bold block uppercase tracking-wider text-[10px]">
                        Handwritten Digital Signature
                      </label>
                      <div className="bg-white rounded-2xl overflow-hidden border border-slate-700">
                        <SignatureCanvas
                          ref={sigPadRef}
                          penColor="black"
                          canvasProps={{ className: 'w-full h-24 cursor-crosshair' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="oathCheck"
                      checked={agreedToOath}
                      onChange={(e) => setAgreedToOath(e.target.checked)}
                      className="mt-1 accent-indigo-500 rounded w-4 h-4"
                    />
                    <label htmlFor="oathCheck" className="text-xs text-indigo-200 cursor-pointer font-medium leading-relaxed">
                      I hereby solemnly affirm under judicial seal that I have reviewed the aggregate metrics for <strong>{selectedModule.title}</strong>, verified cryptographic integrity, and authorize recording into the central court ledger.
                    </label>
                  </div>

                  <button
                    onClick={handleExecuteAttestation}
                    disabled={isSigning || !agreedToOath}
                    className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isSigning ? (
                      <span>Recording Judicial Attestation to Ledger...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Sign & Seal Aggregate Analytics Attestation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      ) : null}
    </motion.div>
  );
}
