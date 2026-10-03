import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Folder as FolderIcon, FileText, Plus, FileUp, Menu, ChevronRight, Home, Lock, Globe, Users, Download, Trash2, MoreVertical, Info, Eye } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import CreateFolderModal from '../components/CreateFolderModal';
import UploadDocModal from '../components/UploadDocModal';
import ItemDetailsModal from '../components/ItemDetailsModal';

const visIcon = { Privé: Lock, Public: Globe, Restreint: Users };

export default function Documents() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [folders, setFolders] = useState([]);
    const [docs, setDocs] = useState([]);
    const [path, setPath] = useState([]);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [detailsItem, setDetailsItem] = useState(null);

    const currentFolderId = path.length > 0 ? path[path.length - 1]._id : null;

    const fetchData = () => {
        const q = currentFolderId ? `?parent=${currentFolderId}` : '';
        const qd = currentFolderId ? `?folder=${currentFolderId}` : '';
        api.get(`/folders${q}`).then(res => setFolders(res.data)).catch(() => { });
        api.get(`/documents${qd}`).then(res => setDocs(res.data)).catch(() => { });
    };

    useEffect(() => { fetchData(); }, [currentFolderId]);
    useEffect(() => {
        const folderId = searchParams.get('folder');
        const docId = searchParams.get('doc');
        if (folderId) {
            api.get(`/folders/${folderId}`).then(res => setPath([{ _id: res.data._id, name: res.data.name }])).catch(() => alert('Accès refusé ou dossier introuvable'));
        } else if (docId) {
            api.get(`/documents/${docId}`).then(res => setDetailsItem({ item: res.data, type: 'document' })).catch(() => alert('Accès refusé ou document introuvable'));
        }
    }, []);

    useEffect(() => {
        const handleClick = () => setOpenMenuId(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const openFolder = (folder) => setPath([...path, { _id: folder._id, name: folder.name }]);
    const goToBreadcrumb = (index) => setPath(path.slice(0, index + 1));
    const goHome = () => setPath([]);

    const handleDeleteFolder = async (folder) => {
        if (!confirm(`Supprimer le dossier "${folder.name}" ?`)) return;
        try {
            await api.delete(`/folders/${folder._id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur');
        }
    };

    const handleDeleteDoc = async (doc) => {
        if (!confirm(`Supprimer "${doc.name}" ?`)) return;
        try {
            await api.delete(`/documents/${doc._id}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.error || 'Erreur');
        }
    };

    const formatSize = (bytes) => {
        if (!bytes) return '';
        const kb = bytes / 1024;
        return kb > 1024 ? `${(kb / 1024).toFixed(1)} Mo` : `${Math.round(kb)} Ko`;
    };

    const formatShortDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    const handleDownload = async (doc) => {
        try {
            const res = await fetch(doc.fileUrl);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = doc.name;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Échec du téléchargement');
        }
    };

    return (
        <div className="app-shell">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="main-area">
                <div className="page-content">
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} style={{ marginBottom: 12 }}>
                        <Menu size={22} />
                    </button>

                    <div className="page-header">
                        <div className="page-title-row">
                            <div className="page-icon" style={{ background: '#b45309' }}><FolderIcon size={22} /></div>
                            <div>
                                <h2 className="page-title">Documents VitalLink</h2>
                                <p className="page-subtitle">Classeur partagé de l'équipe — dossiers, contrats, présentations.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-outline" onClick={() => setShowCreateFolder(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Plus size={15} /> Dossier
                            </button>
                            <button className="btn" onClick={() => setShowUpload(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#4338ca' }}>
                                <FileUp size={15} /> Document
                            </button>
                        </div>
                    </div>

                    <div className="breadcrumb">
                        <span className="breadcrumb-item" onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Home size={14} /> Accueil</span>
                        {path.map((p, i) => (
                            <span key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <ChevronRight size={14} />
                                <span className="breadcrumb-item" onClick={() => goToBreadcrumb(i)}>{p.name}</span>
                            </span>
                        ))}
                    </div>

                    {folders.length > 0 && (
                        <div className="folder-grid">
                            {folders.map(f => {
                                const VisIcon = visIcon[f.visibility];
                                return (
                                    <div key={f._id} className="folder-card" onClick={() => openFolder(f)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div className="folder-card-icon"><FolderIcon size={20} /></div>
                                            <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                                                <button className="action-menu-btn" onClick={() => setOpenMenuId(openMenuId === `f-${f._id}` ? null : `f-${f._id}`)}>
                                                    <MoreVertical size={16} />
                                                </button>
                                                {openMenuId === `f-${f._id}` && (
                                                    <div className="action-menu-dropdown">
                                                        <button className="action-menu-item" onClick={() => { setDetailsItem({ item: f, type: 'folder' }); setOpenMenuId(null); }}>
                                                            <Info size={14} /> Détails
                                                        </button>
                                                        {(f.createdByName === user?.name || user?.role === 'admin') && (
                                                            <button className="action-menu-item danger" onClick={() => { handleDeleteFolder(f); setOpenMenuId(null); }}>
                                                                <Trash2 size={14} /> Supprimer
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="folder-card-name">{f.name}</div>
                                        <span className={`visibility-badge ${f.visibility.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                                            <VisIcon size={11} /> {f.visibility}
                                        </span>
                                        <div style={{ fontSize: 11, color: '#999' }}>{f.createdByName} · {formatShortDate(f.createdAt)}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {docs.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {docs.map(d => {
                                const VisIcon = visIcon[d.visibility];
                                return (
                                    <div key={d._id} className="doc-card">
                                        <div className="doc-card-icon"><FileText size={18} /></div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="doc-card-name">{d.name}</div>
                                            <div className="doc-card-meta">{formatSize(d.fileSize)} · {d.createdByName} · {formatShortDate(d.createdAt)}</div>
                                        </div>
                                        <span className={`visibility-badge ${d.visibility.toLowerCase()}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <VisIcon size={11} /> {d.visibility}
                                        </span>
                                        <a href={d.fileUrl} target="_blank" rel="noreferrer" className="action-menu-btn" title="Aperçu"><Eye size={17} /></a>
                                        <button onClick={() => handleDownload(d)} className="action-menu-btn" title="Télécharger"><Download size={17} /></button>
                                        <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                                            <button className="action-menu-btn" onClick={() => setOpenMenuId(openMenuId === `d-${d._id}` ? null : `d-${d._id}`)}>
                                                <MoreVertical size={17} />
                                            </button>
                                            {openMenuId === `d-${d._id}` && (
                                                <div className="action-menu-dropdown">
                                                    <button className="action-menu-item" onClick={() => { setDetailsItem({ item: d, type: 'document' }); setOpenMenuId(null); }}>
                                                        <Info size={14} /> Détails
                                                    </button>
                                                    {(d.createdByName === user?.name || user?.role === 'admin') && (
                                                        <button className="action-menu-item danger" onClick={() => { handleDeleteDoc(d); setOpenMenuId(null); }}>
                                                            <Trash2 size={14} /> Supprimer
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {folders.length === 0 && docs.length === 0 && (
                        <div style={{ textAlign: 'center', color: '#999', padding: 50 }}>Ce dossier est vide.</div>
                    )}
                </div>
            </div>

            {showCreateFolder && <CreateFolderModal parentId={currentFolderId} onClose={() => setShowCreateFolder(false)} onCreated={() => { setShowCreateFolder(false); fetchData(); }} />}
            {showUpload && <UploadDocModal folderId={currentFolderId} onClose={() => setShowUpload(false)} onUploaded={() => { setShowUpload(false); fetchData(); }} />}
            {detailsItem && (
                <ItemDetailsModal
                    item={detailsItem.item}
                    type={detailsItem.type}
                    currentUser={user}
                    onClose={() => setDetailsItem(null)}
                    onUpdated={() => { setDetailsItem(null); fetchData(); }}
                />
            )}
        </div>
    );
}