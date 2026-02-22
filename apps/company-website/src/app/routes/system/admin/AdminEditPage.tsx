import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { CMSService, PageContent } from '../../../services/cms.service';
import { getFirebaseApp } from '../../../services/firebase.service';
import { doc, updateDoc, getFirestore, serverTimestamp } from 'firebase/firestore';
import { AuthService } from '../../../services/auth.service';

export const AdminEditPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageContent | null>(null);
  const [content, setContent] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      CMSService.getPageBySlug(slug).then(p => {
        if (p) {
          setPage(p);
          setContent(p.content);
          setSeoTitle(p.seo?.title || '');
          setSeoDesc(p.seo?.description || '');
          setSeoKeywords(p.seo?.keywords || '');
        }
      });
      // Fetch History
      CMSService.getHistoryEntries(slug).then(setHistory);
    }
  }, [slug]);

  const handleRestore = (version: any) => {
    if (window.confirm('Möchten Sie den Inhalt dieser Version wirklich in das Formular laden? (Nicht gespeicherte Änderungen gehen verloren)')) {
      setContent(version.content);
      setSeoTitle(version.seo?.title || '');
      setSeoDesc(version.seo?.description || '');
      setSeoKeywords(version.seo?.keywords || '');
      setStatus('Version geladen. Bitte Speichern zum Übernehmen.');
    }
  };

  const handleSave = async () => {
    if (!slug || !page) return;
    setStatus('Speichere...');
    try {
      const db = getFirestore(getFirebaseApp());
      const pageRef = doc(db, 'static_pages', slug);
      
      // 1. SAVE TO HISTORY BEFORE UPDATE
      await CMSService.saveHistoryEntry(slug, {
        content: page.content,
        seo: page.seo,
        title: page.title,
        updatedAt: serverTimestamp()
      });

      // 2. Perform Update logic
      const seoChanged = 
        seoTitle !== (page.seo?.title || '') || 
        seoDesc !== (page.seo?.description || '') ||
        seoKeywords !== (page.seo?.keywords || '');
      
      const updateData: any = { content };
      if (seoChanged) {
        updateData.seo = {
          ...page.seo,
          title: seoTitle,
          description: seoDesc,
          keywords: seoKeywords
        };
      }

      await updateDoc(pageRef, updateData);

      // Trigger re-build flag if SEO changed
      if (seoChanged) {
        const cicdRef = doc(db, 'config', 'cicd');
        await updateDoc(cicdRef, { 
          needsRebuild: true,
          pendingSEOChanges: [...(page.pendingSEOChanges || []), slug]
        });
        setStatus('Gespeichert! (Rebuild geplant)');
      } else {
        setStatus('Gespeichert!');
      }
      
      // Update local state and history list
      setPage({ ...page, ...updateData });
      CMSService.getHistoryEntries(slug).then(setHistory);
      
    } catch (err: any) {
      console.error(err);
      setStatus('Fehler beim Speichern');
    }
  };

  if (!page) return <p>Lädt...</p>;

  return (
    <div className="admin-edit" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      <div className="main-form">
        <h1>Seite bearbeiten: {page.title}</h1>
        
        <div style={{ marginBottom: '1.5rem', border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
          <h3>SEO-Einstellungen</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="seoTitle">Meta Title</label><br/>
            <input 
              id="seoTitle"
              type="text" 
              value={seoTitle} 
              onChange={(e) => setSeoTitle(e.target.value)} 
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="seoDesc">Meta Description</label><br/>
            <textarea 
              id="seoDesc"
              value={seoDesc} 
              onChange={(e) => setSeoDesc(e.target.value)} 
              rows={3} 
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div>
            <label htmlFor="seoKeywords">Keywords (kommagetrennt)</label><br/>
            <input 
              id="seoKeywords"
              type="text" 
              value={seoKeywords} 
              onChange={(e) => setSeoKeywords(e.target.value)} 
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="pageContent">Inhalt (HTML/Text)</label><br/>
          <textarea 
            id="pageContent"
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={10} 
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        
        <button onClick={handleSave}>Speichern</button>
        <button onClick={() => navigate('/admin/dashboard')} style={{ marginLeft: '1rem' }}>Zurück</button>
        {status && <p style={{ fontWeight: 'bold', color: status.includes('Rebuild') ? '#d97706' : '#059669' }}>{status}</p>}
      </div>

      <aside className="history-sidebar" style={{ borderLeft: '1px solid #eee', paddingLeft: '2rem' }}>
        <h3>Versionshistorie</h3>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>Wiederherstellen früherer Stände (Snapshots vor Speicherung)</p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {history.map((entry) => (
            <li key={entry.id} style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              border: '1px solid #eee', 
              borderRadius: '6px',
              fontSize: '0.9rem' 
            }}>
              <div style={{ fontWeight: 'bold' }}>
                {entry.createdAt ? entry.createdAt.toLocaleString() : 'Datum unbekannt'}
              </div>
              <button 
                onClick={() => handleRestore(entry)}
                style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}
              >
                Snapshot laden
              </button>
            </li>
          ))}
          {history.length === 0 && <p>Keine Historie vorhanden.</p>}
        </ul>
      </aside>
    </div>
  );
};
