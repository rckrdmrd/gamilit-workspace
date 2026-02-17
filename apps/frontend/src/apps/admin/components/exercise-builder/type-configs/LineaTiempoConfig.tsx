import { Plus, Trash2, GripVertical } from 'lucide-react';

interface TimelineEvent {
  id: string;
  label: string;
  description: string;
  correctOrder: number;
}

interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function LineaTiempoConfig({ config, onChange }: TypeConfigProps) {
  const events = (config.events as TimelineEvent[]) || [];

  const addEvent = () => {
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      label: '',
      description: '',
      correctOrder: events.length + 1,
    };
    onChange({ ...config, events: [...events, newEvent] });
  };

  const updateEvent = (idx: number, field: string, value: unknown) => {
    const updated = events.map((e, i) => (i === idx ? { ...e, [field]: value } : e));
    onChange({ ...config, events: updated });
  };

  const removeEvent = (idx: number) => {
    const updated = events
      .filter((_, i) => i !== idx)
      .map((e, i) => ({ ...e, correctOrder: i + 1 }));
    onChange({ ...config, events: updated });
  };

  const sortedPreview = [...events].sort((a, b) => a.correctOrder - b.correctOrder);

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-400">
            Eventos ({events.length})
          </label>
          <button
            type="button"
            onClick={addEvent}
            className="flex items-center gap-1 rounded-lg bg-detective-orange/20 px-3 py-1.5 text-sm text-detective-orange hover:bg-detective-orange/30"
          >
            <Plus className="h-4 w-4" /> Agregar Evento
          </button>
        </div>

        <p className="mb-3 text-xs text-gray-500">
          <GripVertical className="mr-1 inline h-3 w-3" />
          Define el orden correcto con el numero de secuencia. Los estudiantes deberan reordenarlos.
        </p>

        <div className="space-y-3">
          {events.map((event, idx) => (
            <div key={event.id} className="rounded-lg border border-gray-700 bg-gray-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-detective-orange">
                  Evento #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeEvent(idx)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px]">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Etiqueta</label>
                  <input
                    type="text"
                    className="input-detective w-full text-sm"
                    placeholder="Ej: Fundacion de Tikal"
                    value={event.label}
                    onChange={(e) => updateEvent(idx, 'label', e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Orden</label>
                  <input
                    type="number"
                    className="input-detective w-full text-sm"
                    min={1}
                    value={event.correctOrder}
                    onChange={(e) =>
                      updateEvent(idx, 'correctOrder', parseInt(e.target.value) || 1)
                    }
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="mb-1 block text-xs text-gray-500">Descripcion</label>
                <input
                  type="text"
                  className="input-detective w-full text-sm"
                  placeholder="Breve descripcion del evento..."
                  value={event.description}
                  onChange={(e) => updateEvent(idx, 'description', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <p className="rounded-lg bg-gray-800/30 p-4 text-center text-sm text-gray-500">
            Agrega eventos para crear la linea de tiempo.
          </p>
        )}
      </div>

      {/* Sorted Preview */}
      {events.length >= 2 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-400">
            Orden Correcto
          </label>
          <div className="space-y-1">
            {sortedPreview.map((e, i) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded bg-gray-800/50 px-3 py-2 text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-detective-orange/20 text-xs font-bold text-detective-orange">
                  {i + 1}
                </span>
                <span className="text-gray-300">{e.label || 'Sin etiqueta'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LineaTiempoConfig;
