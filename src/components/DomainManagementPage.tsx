// Domain Management Page Component (from simple App)
const DomainManagementPage = ({ 
  domains, 
  setDomains, 
  showNotification, 
  loadingDomains, 
  loadDomains 
}: {
  domains: Domain[];
  setDomains: React.Dispatch<React.SetStateAction<Domain[]>>;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  loadingDomains: boolean;
  loadDomains: () => Promise<void>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenAddModal = () => {
    setEditingDomain(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (domain: Domain) => {
    setEditingDomain(domain);
    setIsModalOpen(true);
  };

  const handleSaveDomain = async (domainData: any) => {
    setLoading(true);
    try {
      if (editingDomain) {
        const updatedDomain = await domainService.updateDomain(editingDomain.id, domainData);
        setDomains(prev => prev.map(d => d.id === editingDomain.id ? updatedDomain : d));
        showNotification(`Domain '${updatedDomain.name}' updated successfully.`, 'success');
      } else {
        const newDomain = await domainService.createDomain(domainData);
        setDomains(prev => [...prev, newDomain]);
        showNotification(`Domain '${newDomain.name}' created successfully.`, 'success');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save domain:', error);
      showNotification('Failed to save domain. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    const domain = domains.find(d => d.id === domainId);
    if (!domain) return;
    
    if (!confirm(`Are you sure you want to delete the domain "${domain.name}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await domainService.deleteDomain(domainId);
      setDomains(prev => prev.filter(d => d.id !== domainId));
      showNotification(`Domain '${domain.name}' deleted successfully.`, 'success');
    } catch (error) {
      console.error('Failed to delete domain:', error);
      showNotification('Failed to delete domain. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEmbedding = async (domainId: string, type: string) => {
    const domain = domains.find(d => d.id === domainId);
    if (!domain) return;
    
    setLoading(true);
    showNotification(`Generating ${type} embedding for '${domain.name}'...`, 'info');
    
    try {
      const embeddingType = type === 'Ollama' ? 'ollama' : 'st';
      await domainService.generateEmbedding(domainId, embeddingType);
      await loadDomains();
      showNotification(`${type} embedding generated successfully for '${domain.name}'.`, 'success');
    } catch (error) {
      console.error('Failed to generate embedding:', error);
      showNotification(`Failed to generate ${type} embedding. Please try again.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loadingDomains) {
    return (
      <div className="animate-fade-in">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Manage Domains</h1>
            <p className="text-lg text-gray-400 mt-1">Loading domains...</p>
          </div>
          <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Manage Domains</h1>
          <p className="text-lg text-gray-400 mt-1">Individual domain tables with enhanced metadata.</p>
        </div>
        <button 
          onClick={handleOpenAddModal} 
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 px-4 py-2 bg-cyan-500 text-white hover:bg-cyan-500/90 disabled:opacity-50"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Domain
        </button>
      </div>

      {isModalOpen && (
        <DomainModal 
          domain={editingDomain} 
          onSave={handleSaveDomain} 
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
        />
      )}

      <div className="space-y-4">
        {domains.filter(domain => domain.id !== null).length === 0 ? (
          <div className="bg-gray-800/70 border border-gray-700 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="text-center py-12 p-4 md:p-6">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No domains yet</h3>
              <p className="text-gray-400 mb-4">Get started by creating your first domain.</p>
              <button 
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors px-4 py-2 bg-cyan-500 text-white hover:bg-cyan-500/90"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Create First Domain
              </button>
            </div>
          </div>
        ) : (
          domains.filter(domain => domain.id !== null).map(domain => (
            <DomainCard 
              key={domain.id} 
              domain={domain} 
              onEdit={() => handleOpenEditModal(domain)}
              onDelete={() => handleDeleteDomain(domain.id)}
              onGenerateEmbedding={handleGenerateEmbedding}
              loading={loading}
            />
          ))
        )}
      </div>
    </div>
  );
};