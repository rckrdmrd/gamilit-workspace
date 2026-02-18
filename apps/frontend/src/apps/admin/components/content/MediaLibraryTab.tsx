import { DataTable, Column } from '@shared/components/common';
import { useMediaLibraryQuery } from '../../hooks/useContentQueries';
import type { MediaItem } from '../../types';

export function MediaLibraryTab() {
  const {
    media,
    loading: loadingMedia,
    error_message: errorMedia,
  } = useMediaLibraryQuery();

  const mediaColumns: Column<MediaItem>[] = [
    {
      key: 'filename',
      label: 'Nombre',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-detective-text">{row.filename || row.name}</p>
          <p className="text-xs text-gray-400">{row.type}</p>
        </div>
      ),
    },
    {
      key: 'uploadedBy',
      label: 'Subido por',
      sortable: true,
    },
    {
      key: 'size',
      label: 'Tamano',
      sortable: true,
      render: (row) => {
        const sizeInMB = (row.size / (1024 * 1024)).toFixed(2);
        return `${sizeInMB} MB`;
      },
    },
    {
      key: 'uploadedAt',
      label: 'Fecha',
      sortable: true,
      render: (row) => new Date(row.uploadedAt).toLocaleDateString('es-ES'),
    },
  ];

  return (
    <div>
      {errorMedia && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
          <p className="font-semibold">Error:</p>
          <p>{errorMedia}</p>
        </div>
      )}

      {loadingMedia && !media.length ? (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
          <p className="mt-4 text-detective-text-secondary">
            Cargando archivos multimedia...
          </p>
        </div>
      ) : (
        <DataTable
          data={media}
          columns={mediaColumns}
          searchPlaceholder="Buscar archivos..."
        />
      )}
    </div>
  );
}
