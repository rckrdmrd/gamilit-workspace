import { useState } from 'react';
import { Share2, Star, Download, MessageCircle, Search, Loader2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { InputDetective } from '@shared/components/base/InputDetective';
import { useSharedResources } from '../../hooks/useSharedResources';

export function ResourceSharingPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentResource, setActiveCommentResource] = useState<string | null>(null);

  const {
    resources,
    loading,
    error,
    rateResource,
    addComment,
    downloadResource,
    updateFilters,
    refresh,
  } = useSharedResources();

  const categories = ['all', 'Pedagogia', 'Ejercicios', 'Evaluaciones', 'Multimedia'];

  // Client-side filtering by search term (API also supports server-side search)
  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Trigger server-side search for better results with large datasets
    if (value.length >= 3 || value.length === 0) {
      updateFilters({ search: value || undefined });
    }
  };

  const handleCategoryChange = (cat: string) => {
    setCategoryFilter(cat);
    updateFilters({ category: cat === 'all' ? undefined : cat });
  };

  const handleRate = async (resourceId: string, rating: number) => {
    try {
      await rateResource(resourceId, rating);
    } catch {
      // Error is set in hook state
    }
  };

  const handleDownload = async (resourceId: string) => {
    try {
      await downloadResource(resourceId);
    } catch {
      // Error is set in hook state
    }
  };

  const handleAddComment = async (resourceId: string) => {
    const text = commentInputs[resourceId]?.trim();
    if (!text) return;

    try {
      await addComment(resourceId, text);
      setCommentInputs((prev) => ({ ...prev, [resourceId]: '' }));
      setActiveCommentResource(null);
    } catch {
      // Error is set in hook state
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Share2 className="h-8 w-8 text-detective-orange" />
        <div>
          <h2 className="text-2xl font-bold text-detective-text">Recursos Compartidos</h2>
          <p className="text-detective-text-secondary">
            Comparte y descubre recursos con otros profesores
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <DetectiveCard>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
            <InputDetective
              type="text"
              placeholder="Buscar recursos..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <DetectiveButton
                key={cat}
                variant={categoryFilter === cat ? 'primary' : 'secondary'}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat === 'all' ? 'Todos' : cat}
              </DetectiveButton>
            ))}
          </div>
        </div>
      </DetectiveCard>

      {/* Error state */}
      {error && (
        <DetectiveCard>
          <div className="flex items-center justify-between py-4">
            <p className="text-red-500">{error.message}</p>
            <DetectiveButton variant="secondary" onClick={refresh}>
              Reintentar
            </DetectiveButton>
          </div>
        </DetectiveCard>
      )}

      {/* Loading state */}
      {loading && (
        <DetectiveCard>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="mr-2 h-6 w-6 animate-spin text-detective-orange" />
            <span className="text-detective-text-secondary">Cargando recursos...</span>
          </div>
        </DetectiveCard>
      )}

      {/* Resources Grid */}
      {!loading && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredResources.map((resource) => (
            <DetectiveCard key={resource.id} hoverable={false}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 font-bold text-detective-text">{resource.title}</h3>
                    <p className="mb-2 text-sm text-detective-text-secondary">
                      {resource.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-detective-bg-secondary px-2 py-1 text-xs font-semibold text-detective-text">
                        {resource.category}
                      </span>
                      <span className="text-xs text-detective-text-secondary">
                        por {resource.author_name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-detective-text-secondary">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(resource.id, star)}
                          className="transition-transform hover:scale-110"
                          title={`Calificar ${star}`}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              star <= Math.round(resource.rating)
                                ? 'fill-detective-gold text-detective-gold'
                                : 'text-detective-text-secondary'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span>{resource.rating.toFixed(1)}</span>
                    <span>({resource.ratings_count})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    <span>{resource.downloads}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{resource.comments.length}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-detective-bg px-2 py-1 text-xs text-detective-text-secondary"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Comments section */}
                {resource.comments.length > 0 && (
                  <div className="space-y-2 border-t border-detective-border pt-3">
                    {resource.comments.slice(0, 3).map((comment) => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-semibold text-detective-text">
                          {comment.author_name}:
                        </span>{' '}
                        <span className="text-detective-text-secondary">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment input */}
                {activeCommentResource === resource.id && (
                  <div className="flex gap-2">
                    <InputDetective
                      type="text"
                      placeholder="Escribe un comentario..."
                      value={commentInputs[resource.id] || ''}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [resource.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(resource.id);
                      }}
                      className="flex-1"
                    />
                    <DetectiveButton
                      variant="primary"
                      onClick={() => handleAddComment(resource.id)}
                      disabled={!commentInputs[resource.id]?.trim()}
                    >
                      Enviar
                    </DetectiveButton>
                  </div>
                )}

                <div className="flex gap-2 border-t border-detective-border pt-3">
                  <DetectiveButton variant="secondary" onClick={() => handleDownload(resource.id)}>
                    <Download className="h-4 w-4" />
                    Descargar
                  </DetectiveButton>
                  <DetectiveButton
                    variant="secondary"
                    onClick={() =>
                      setActiveCommentResource(
                        activeCommentResource === resource.id ? null : resource.id,
                      )
                    }
                  >
                    <MessageCircle className="h-4 w-4" />
                    Comentar
                  </DetectiveButton>
                </div>
              </div>
            </DetectiveCard>
          ))}
        </div>
      )}

      {!loading && filteredResources.length === 0 && (
        <DetectiveCard>
          <div className="py-12 text-center">
            <Share2 className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
            <p className="text-detective-text-secondary">No se encontraron recursos</p>
          </div>
        </DetectiveCard>
      )}
    </div>
  );
}
