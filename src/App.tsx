import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Globe, 
  Mail, 
  ChevronRight, 
  Copy, 
  RefreshCcw,
  CheckCircle2,
  AlertCircle,
  Plus,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Info,
  HelpCircle,
  ExternalLink,
  LogOut,
  User,
  Lock,
  ArrowRight,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DNSRecord, DomainInfo } from './types';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(user, { displayName: name });
        // Create user doc
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-indigo-600/20">
            <Mail className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">SendFlow</h1>
          <p className="text-slate-500 font-medium mt-1">
            {isLogin ? 'Welcome back to professional mailing' : 'Start your domain marketing journey'}
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Login
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@company.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-600/20"
          >
            {loading ? <RefreshCcw size={20} className="animate-spin" /> : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-indigo-600 font-bold hover:underline"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const RecordCard = ({ record, onVerify, stepNumber }: { record: DNSRecord; onVerify: () => void; stepNumber: number }) => {
  const isChecking = record.status === 'checking';
  const isDKIM = record.type === 'DKIM';
  const isDMARC = record.type === 'DMARC';
  
  return (
    <article className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col ${record.status !== 'valid' ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider">
          {stepNumber}. {record.type} Record
        </h3>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
          record.status === 'valid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {record.status === 'valid' ? 'Verified' : 'Action Required'}
        </span>
      </div>
      
      <div className="p-5 space-y-4 flex-1">
        <p className="text-sm text-slate-600 leading-relaxed">
          {record.type === 'SPF' && "Ensure our mail servers are authorized to send on behalf of your domain."}
          {record.type === 'DKIM' && "Digitally sign your emails to prevent tampering during transit."}
          {record.type === 'DMARC' && "Instruct providers on how to handle emails failing SPF/DKIM checks."}
        </p>
        
        <div className="bg-slate-900 rounded p-3 code-font text-xs text-indigo-300 relative group overflow-hidden">
          <div 
            onClick={() => navigator.clipboard.writeText(record.status === 'valid' ? record.value || '' : record.recommended || '')}
            className="absolute top-2 right-2 hidden group-hover:block px-2 py-1 bg-indigo-500 text-white rounded cursor-pointer text-[10px]"
          >
            Copy
          </div>
          <div className="truncate font-mono">
            {record.status === 'valid' ? record.value : record.recommended}
          </div>
        </div>
        
        <div className="text-[11px] text-slate-400">
          Type: <span className="text-slate-900 font-medium">TXT</span> | 
          Host: <span className="text-slate-900 font-medium">
            {isDKIM ? `${record.selector}._domainkey` : isDMARC ? '_dmarc' : '@'}
          </span>
        </div>
      </div>

      {record.status !== 'valid' && (
        <div className="p-4 bg-indigo-50 flex justify-center border-t border-indigo-100">
          <button 
            onClick={onVerify}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            disabled={isChecking}
          >
            {isChecking && <RefreshCcw size={12} className="animate-spin" />}
            VERIFY RECORD NOW
          </button>
        </div>
      )}
    </article>
  );
};

export default function App() {
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'domain' | 'contacts' | 'analytics'>('dashboard');
  const [activeDomain, setActiveDomain] = useState<DomainInfo | null>(null);
  const [domainList, setDomainList] = useState<DomainInfo[]>([]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || ''
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Use Firestore for persistence
  useEffect(() => {
    if (!user) return;

    // Contacts Listener
    const qContacts = query(collection(db, 'contacts'), where('userId', '==', auth.currentUser?.uid));
    const unsubContacts = onSnapshot(qContacts, (snapshot) => {
      setContactList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'contacts'));

    // Campaigns Listener
    const qCampaigns = query(
      collection(db, 'campaigns'), 
      where('userId', '==', auth.currentUser?.uid),
      orderBy('id', 'desc')
    );
    const unsubCampaigns = onSnapshot(qCampaigns, (snapshot) => {
      setCampaignList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'campaigns'));

    // Domains Listener
    const qDomains = query(collection(db, 'domains'), where('userId', '==', auth.currentUser?.uid));
    const unsubDomains = onSnapshot(qDomains, (snapshot) => {
      const domains = snapshot.docs.map(doc => doc.data() as DomainInfo);
      setDomainList(domains);
      if (domains.length > 0 && !activeDomain) {
        setActiveDomain(domains[0]);
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'domains'));

    return () => {
      unsubContacts();
      unsubCampaigns();
      unsubDomains();
    };
  }, [user]);

  const [inputDomain, setInputDomain] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ subject: '', content: '' });
  const [newContactEmail, setNewContactEmail] = useState('');

  // Campaigns State
  const [campaignList, setCampaignList] = useState<any[]>([]);
  const [sendingLogs, setSendingLogs] = useState<string[]>([]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.subject || !auth.currentUser) return;
    
    const id = Date.now();
    const campaign = {
      id,
      subject: newCampaign.subject,
      sentTo: contactList.length,
      status: 'Queued',
      time: 'Just now',
      delivery: '0%',
      userId: auth.currentUser.uid,
      createdAt: serverTimestamp()
    };
    
    setNewCampaign({ subject: '', content: '' });
    setShowCampaignModal(false);

    // Simulate Sending Process
    setSendingLogs(prev => [`[${new Date().toLocaleTimeString()}] Queueing campaign: ${newCampaign.subject}`, ...prev]);
    
    // We need the document ID to update it. addDoc returns the docRef.
    let docRef: any;
    try {
      docRef = await addDoc(collection(db, 'campaigns'), campaign);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'campaigns');
      return;
    }

    setTimeout(async () => {
      await setDoc(docRef, { status: 'Sending', delivery: '15%' }, { merge: true });
      setSendingLogs(prev => [`[${new Date().toLocaleTimeString()}] Starting delivery to ${contactList.length} contacts`, ...prev]);
    }, 2000);

    setTimeout(async () => {
      await setDoc(docRef, { status: 'Sending', delivery: '65%' }, { merge: true });
      setSendingLogs(prev => [`[${new Date().toLocaleTimeString()}] SMTP handshakes successful...`, ...prev]);
    }, 5000);

    setTimeout(async () => {
      await setDoc(docRef, { status: 'Success', delivery: '100%' }, { merge: true });
      setSendingLogs(prev => [`[${new Date().toLocaleTimeString()}] Campaign completed! All emails processed.`, ...prev]);
    }, 8000);
  };

  // Contacts State
  const [contactList, setContactList] = useState<any[]>([]);

  const handleAddManualContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactEmail || !auth.currentUser) return;
    const newC = {
      email: newContactEmail,
      status: 'Active',
      source: 'Manual',
      added: 'Just now',
      userId: auth.currentUser.uid
    };
    
    setNewContactEmail('');
    setShowAddContactModal(false);

    // Persist to Firestore
    try {
      await addDoc(collection(db, 'contacts'), newC);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'contacts');
    }
  };

  const handleDeleteContact = async (email: string) => {
    if (!auth.currentUser) return;
    
    // In a real app, you'd use the document ID. Since we have the email, we'll find the doc.
    try {
      const q = query(collection(db, 'contacts'), where('email', '==', email), where('userId', '==', auth.currentUser.uid));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (docSnap) => {
        await deleteDoc(doc(db, 'contacts', docSnap.id));
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contacts/${email}`);
    }
  };

  const handleImportContacts = async () => {
    if (!auth.currentUser) return;
    const imports = [
      { email: `user_${Math.floor(Math.random()*1000)}@import.com`, status: 'Active', source: 'Bulk Import', added: 'Just now', userId: auth.currentUser.uid },
      { email: `lead_${Math.floor(Math.random()*1000)}@crm.com`, status: 'Active', source: 'Bulk Import', added: 'Just now', userId: auth.currentUser.uid },
    ];
    
    try {
      for (const contact of imports) {
        await addDoc(collection(db, 'contacts'), contact);
      }
      alert('Imported 2 contacts successfully!');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'contacts/bulk');
    }
  };

  // Dynamic dashboard stats
  const totalSent = campaignList.reduce((acc, c) => acc + (c.sentTo || 0), 0);
  const dashboardStats = [
    { label: 'Total Sent', value: totalSent.toLocaleString(), trend: campaignList.length > 0 ? 'Live' : '0%', color: 'text-indigo-600' },
    { label: 'Avg. Open Rate', value: '0%', trend: '0%', color: 'text-emerald-600' },
    { label: 'Bounce Rate', value: '0%', trend: '0%', color: 'text-slate-600' },
    { label: 'Unsubscribes', value: '0', trend: '0', color: 'text-rose-600' },
  ];

  const generateRecommended = (name: string, type: string) => {
    if (type === 'SPF') return `v=spf1 include:_spf.google.com ~all`;
    if (type === 'DMARC') return `v=DMARC1; p=quarantine; rua=mailto:admin@${name}`;
    if (type === 'DKIM') return `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv...`;
    return '';
  };

  const verifyRecord = async (domainName: string, type: 'SPF' | 'DKIM' | 'DMARC', selector?: string) => {
    try {
      let queryName = domainName;
      if (type === 'DKIM') queryName = `${selector || 'google'}._domainkey.${domainName}`;
      if (type === 'DMARC') queryName = `_dmarc.${domainName}`;

      const response = await fetch(`https://dns.google/resolve?name=${queryName}&type=TXT`);
      const data = await response.json();
      
      if (data.Answer && data.Answer.length > 0) {
        const records = data.Answer.map((a: any) => a.data.replace(/"/g, ''));
        let verified = false;
        if (type === 'SPF') verified = records.some((r: string) => r.includes('v=spf1'));
        if (type === 'DKIM') verified = records.some((r: string) => r.includes('v=DKIM1'));
        if (type === 'DMARC') verified = records.some((r: string) => r.includes('v=DMARC1'));
        
        return { 
          status: verified ? 'Verified' : 'Unverified', 
          value: records[0] 
        };
      }
      return { status: 'Unverified' };
    } catch (e) {
      console.error(e);
      return { status: 'Unverified' };
    }
  };

  const handleAddDomain = async (name: string) => {
    if (!name) return;
    const freshDomain: DomainInfo = {
      name,
      spf: { type: 'SPF', domain: name, status: 'checking', recommended: generateRecommended(name, 'SPF') },
      dkim: { type: 'DKIM', domain: name, status: 'checking', selector: 'google', recommended: generateRecommended(name, 'DKIM') },
      dmarc: { type: 'DMARC', domain: name, status: 'checking', recommended: generateRecommended(name, 'DMARC') }
    };
    setActiveDomain(freshDomain);
    setInputDomain('');
    setShowAddModal(false);
    
    // Auto verify
    const [spf, dkim, dmarc] = await Promise.all([
      verifyRecord(name, 'SPF'),
      verifyRecord(name, 'DKIM', 'google'),
      verifyRecord(name, 'DMARC')
    ]);

    const finalDomain = {
      ...freshDomain,
      userId: auth.currentUser?.uid,
      createdAt: new Date().toISOString(),
      spf: { ...freshDomain.spf, status: spf.status, value: spf.records?.[0]?.join('') },
      dkim: { ...freshDomain.dkim, status: dkim.status, value: dkim.records?.[0]?.join('') },
      dmarc: { ...freshDomain.dmarc, status: dmarc.status, value: dmarc.records?.[0]?.join('') }
    };

    setActiveDomain(finalDomain as any);

    // Persist Domain to Firestore
    try {
      if (auth.currentUser) {
        await setDoc(doc(db, 'domains', name.replace(/\./g, '_')), finalDomain);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'domains');
    }
  };

  useEffect(() => {
    // Rely on Firestore listener for existing domains
  }, []);

  if (!user) {
    return <AuthView onLogin={setUser} />;
  }

  return (
    <div className="flex bg-slate-50 text-slate-900 h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shadow-xl">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">SendFlow Pro</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center space-x-3 p-2 rounded-md transition-colors ${activeView === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} className={activeView === 'dashboard' ? 'text-indigo-400' : ''} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveView('domain')}
            className={`w-full flex items-center space-x-3 p-2 rounded-md transition-colors ${activeView === 'domain' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
          >
            <Globe size={20} className={activeView === 'domain' ? 'text-indigo-400' : ''} />
            <span className="font-medium">Domain Setup</span>
          </button>
          <button 
            onClick={() => setActiveView('contacts')}
            className={`w-full flex items-center space-x-3 p-2 rounded-md transition-colors ${activeView === 'contacts' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
          >
            <Users size={20} className={activeView === 'contacts' ? 'text-indigo-400' : ''} />
            <span>Contacts</span>
          </button>
          <button 
            onClick={() => setActiveView('analytics')}
            className={`w-full flex items-center space-x-3 p-2 rounded-md transition-colors ${activeView === 'analytics' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800'}`}
          >
            <BarChart3 size={20} className={activeView === 'analytics' ? 'text-indigo-400' : ''} />
            <span>Analytics</span>
          </button>
        </nav>

        <div className="p-4 space-y-4">
          <div className="bg-slate-800 p-3 rounded-lg text-xs">
            <p className="mb-2 text-slate-400 uppercase font-semibold tracking-wider">Campaign Limits</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-1">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-right">
              {campaignList.reduce((acc, c) => acc + c.sentTo, 0).toLocaleString()} / Unlimited sent
            </p>
          </div>

          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-white truncate">{user.name}</p>
                <p className="text-[8px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="text-slate-400 hover:text-white p-1 hover:bg-slate-700 rounded transition-colors"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Main /</span>
            <h1 className="text-lg font-semibold text-slate-800 capitalize">{activeView.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center space-x-3">
            {activeView === 'domain' && (
              <>
                <button 
                  onClick={() => activeDomain && handleAddDomain(activeDomain.name)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200 flex items-center gap-2"
                >
                  <RefreshCcw size={16} /> Refresh Status
                </button>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                >
                  <Plus size={16} /> Add New Domain
                </button>
              </>
            )}
            {activeView === 'dashboard' && (
              <button 
                onClick={() => setShowCampaignModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
              >
                <Plus size={16} /> Create Campaign
              </button>
            )}
            {activeView === 'contacts' && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddContactModal(true)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded text-sm font-medium hover:bg-slate-200 flex items-center gap-2"
                >
                  <Plus size={16} /> Add Contact
                </button>
                <button 
                  onClick={handleImportContacts}
                  className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center gap-2"
                >
                  <RefreshCcw size={16} /> Import Contacts
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="p-8 space-y-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeView === 'domain' && activeDomain && (
              <motion.div
                key="domain"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Active Domain Hero Section */}
                <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-sm text-slate-500 uppercase font-bold tracking-widest mb-1 font-mono">Current Domain</p>
                      <h2 className="text-2xl font-bold text-slate-900">{activeDomain.name}</h2>
                    </div>
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        activeDomain.spf.status === 'valid' && activeDomain.dkim.status === 'valid' && activeDomain.dmarc.status === 'valid'
                        ? 'bg-green-500' : 'bg-yellow-400 status-pulse'
                      }`}></span>
                      <span className="text-slate-600 font-medium whitespace-nowrap">
                        {activeDomain.spf.status === 'valid' && activeDomain.dkim.status === 'valid' && activeDomain.dmarc.status === 'valid'
                        ? 'Fully Authenticated' : 'Partial Setup'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {[
                      { label: 'SPF', status: activeDomain.spf.status },
                      { label: 'DKIM', status: activeDomain.dkim.status },
                      { label: 'DMARC', status: activeDomain.dmarc.status },
                    ].map((badge, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={`w-12 h-1 rounded-full mb-2 ${badge.status === 'valid' ? 'bg-green-500' : 'bg-slate-200'}`}></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{badge.label}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <RecordCard record={activeDomain.spf} stepNumber={1} onVerify={() => handleAddDomain(activeDomain.name)} />
                  <RecordCard record={activeDomain.dkim} stepNumber={2} onVerify={() => handleAddDomain(activeDomain.name)} />
                  <RecordCard record={activeDomain.dmarc} stepNumber={3} onVerify={() => handleAddDomain(activeDomain.name)} />
                </div>
              </motion.div>
            )}

            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {dashboardStats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                      <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
                      <p className={`text-xs font-medium mt-1 ${stat.trend === 'Live' ? 'text-indigo-500' : stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {stat.trend === 'Live' ? 'Updating live' : `${stat.trend} from last month`}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-6">Recent Activity</h3>
                    <div className="space-y-4">
                      {campaignList.length === 0 ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center opacity-50 border-2 border-dashed border-slate-100 rounded-xl">
                          <Mail size={32} className="mb-2 text-slate-300" />
                          <p className="text-sm font-medium text-slate-500">No campaigns created yet</p>
                          <p className="text-xs text-slate-400">Click "Create Campaign" to get started</p>
                        </div>
                      ) : (
                        campaignList.map(campaign => (
                          <div key={campaign.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0">
                            <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                              <Mail size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold">Campaign: {campaign.subject}</p>
                              <p className="text-xs text-slate-500">Sent to {campaign.sentTo} contacts • {campaign.time}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-emerald-500">{campaign.delivery} Delivery</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              {campaign.status}
                              {campaign.status === 'Sending' && <RefreshCcw size={10} className="animate-spin text-indigo-400" />}
                            </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-6 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <RefreshCcw size={100} className="animate-spin-slow" />
                    </div>
                    <h3 className="font-bold mb-4 relative z-10">Real-time Sending Logs</h3>
                    <div className="space-y-2 relative z-10 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                      {sendingLogs.length === 0 ? (
                        <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-800 text-center">
                          <p className="text-[10px] text-slate-500 font-medium tracking-widest uppercase text-center w-full">No active logs</p>
                        </div>
                      ) : (
                        sendingLogs.map((log, i) => (
                          <div key={i} className="bg-slate-800/50 p-2 rounded border border-slate-700">
                            <p className="text-[10px] font-mono text-indigo-300 leading-tight">{log}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'contacts' && (
              <motion.div
                key="contacts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
              >
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Email Address</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Source</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Added</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <Users size={40} className="mb-2 text-slate-300" />
                            <p className="text-sm font-bold text-slate-500">Your contact list is empty</p>
                            <p className="text-xs text-slate-400">Add contacts manually or import them to start messaging</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      contactList.map((c, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-900">{c.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                              c.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{c.source}</td>
                          <td className="px-6 py-4 text-sm text-slate-400">{c.added}</td>
                          <td className="px-6 py-4 text-sm">
                            <button 
                              onClick={() => handleDeleteContact(c.email)}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}

            {activeView === 'analytics' && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-4">
                    <BarChart3 size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Advanced Analytics Hub</h2>
                  <p className="text-slate-500 max-w-sm mt-2">Campaign tracking and user engagement metrics will appear here once you start sending emails.</p>
                  <div className="flex gap-4 mt-8">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">0%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Click Rate</p>
                    </div>
                    <div className="w-px h-10 bg-slate-200 self-center"></div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">0%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion</p>
                    </div>
                    <div className="w-px h-10 bg-slate-200 self-center"></div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">$0.00</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Revenue</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Help Footer (Show on Domain view) */}
          {activeView === 'domain' && (
            <section className="bg-slate-900 rounded-xl p-6 text-slate-400 flex flex-col md:flex-row items-center justify-between border border-slate-800 gap-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold">Need help with DNS?</h4>
                  <p className="text-sm">Domain propagation can take up to 48 hours. If records aren't reflecting, check with your DNS provider.</p>
                </div>
              </div>
              <button className="px-6 py-2 border border-slate-700 rounded text-sm font-medium hover:bg-slate-800 transition-colors text-white whitespace-nowrap">
                Download Setup Guide
              </button>
            </section>
          )}
        </div>
      </main>

      {/* Add Domain Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-slate-200"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Add New Domain</h2>
              <p className="text-slate-500 mb-6 font-medium">Verify your domain to start sending professional emails.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Domain Name</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="marketing.yourdomain.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={inputDomain}
                    onChange={(e) => setInputDomain(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDomain(inputDomain)}
                  />
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex gap-3">
                    <ShieldCheck className="text-indigo-500 shrink-0" size={20} />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      We will generate SPF, DKIM, and DMARC records for you to add to your DNS provider.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleAddDomain(inputDomain)}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    Add Domain
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddContactModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddContactModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative z-10 border border-slate-200"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-2">New Contact</h2>
              <form onSubmit={handleAddManualContact} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
                  <input 
                    autoFocus
                    type="email" 
                    placeholder="customer@email.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowAddContactModal(false)}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    Add Now
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Campaign Modal */}
      <AnimatePresence>
        {showCampaignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCampaignModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl relative z-10 border border-slate-200"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Campaign</h2>
              <p className="text-sm text-slate-500 mb-2">Send an email to your {contactList.length} verified contacts.</p>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6 flex gap-3 italic">
                <Info className="text-amber-500 shrink-0" size={16} />
                <p className="text-[11px] text-amber-700 leading-tight">
                  <b>Developer Note:</b> This app is currently in simulation mode. No real emails will be delivered to inboxes until a provider (Resend/SendGrid) is connected.
                </p>
              </div>
              
              <form onSubmit={handleCreateCampaign} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email Subject</label>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="e.g. Our Summer Special ✨"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    value={newCampaign.subject}
                    onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Email Content (HTML allowed)</label>
                  <textarea 
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                    placeholder="Hello {{name}}, welcome to our platform..."
                    value={newCampaign.content}
                    onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCampaignModal(false)}
                    className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all"
                  >
                    Start Sending <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
