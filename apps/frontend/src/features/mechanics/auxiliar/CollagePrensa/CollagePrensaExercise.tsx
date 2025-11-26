import React, { useState } from 'react';
import { Image, Type, Plus } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface CollageElement {
  id: string;
  type: 'image' | 'text' | 'headline';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export const CollagePrensaExercise: React.FC = () => {
  const [elements, setElements] = useState<CollageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const addHeadline = () => {
    const newElement: CollageElement = {
      id: Date.now().toString(),
      type: 'headline',
      content: 'MARIE CURIE GANA PREMIO NOBEL',
      x: 10,
      y: 10,
      width: 80,
      height: 15,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const addText = () => {
    const newElement: CollageElement = {
      id: Date.now().toString(),
      type: 'text',
      content: 'La científica descubre el radio...',
      x: 10,
      y: 30,
      width: 40,
      height: 20,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const addImage = (file: UploadedFile) => {
    const newElement: CollageElement = {
      id: Date.now().toString(),
      type: 'image',
      content: file.url,
      x: 20,
      y: 20,
      width: 30,
      height: 30,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  return (
    <div className="min-h-screen bg-detective-bg p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-detective bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className="h-8 w-8 text-detective-orange" />
              <h1 className="text-3xl font-bold text-detective-text">Collage de Prensa</h1>
            </div>
          </div>
          <p className="text-detective-text-secondary">
            Crea un collage estilo periódico sobre Marie Curie y sus logros científicos.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="space-y-4 rounded-detective bg-white p-6 shadow-card">
            <h3 className="font-bold text-detective-text">Herramientas</h3>

            <button
              onClick={addHeadline}
              className="flex w-full items-center gap-2 rounded-detective bg-detective-orange px-4 py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark"
            >
              <Plus className="h-5 w-5" />
              Titular
            </button>

            <button
              onClick={addText}
              className="flex w-full items-center gap-2 rounded-detective bg-detective-blue px-4 py-3 font-medium text-white transition-colors hover:bg-detective-blue/90"
            >
              <Type className="h-5 w-5" />
              Texto
            </button>

            <div>
              <p className="mb-2 font-medium text-detective-text">Agregar Imágenes:</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    addImage({ id: Date.now().toString(), name: file.name, url, type: file.type });
                  }
                }}
                className="w-full rounded-detective border-2 border-gray-300 px-4 py-2"
              />
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-detective-text-secondary">
                💡 Arrastra los elementos en el canvas para organizarlos
              </p>
            </div>
          </div>

          <div className="rounded-detective bg-white p-6 shadow-card lg:col-span-3">
            <div
              className="relative overflow-hidden border-4 border-detective-text bg-yellow-50"
              style={{ aspectRatio: '3/4', minHeight: '800px' }}
            >
              <div className="absolute left-4 right-4 top-4 mb-4 border-b-4 border-detective-text pb-2 text-center">
                <h2 className="font-serif text-4xl font-bold text-detective-text">
                  LE JOURNAL SCIENTIFIQUE
                </h2>
                <p className="text-sm text-detective-text-secondary">Paris, 1903</p>
              </div>

              {elements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => setSelectedElement(element.id)}
                  className={`absolute cursor-move ${
                    selectedElement === element.id ? 'ring-4 ring-detective-orange' : ''
                  }`}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: `${element.width}%`,
                    height: `${element.height}%`,
                    transform: `rotate(${element.rotation}deg)`,
                  }}
                >
                  {element.type === 'headline' && (
                    <div className="bg-detective-text p-3 text-center text-xl font-bold text-white">
                      {element.content}
                    </div>
                  )}
                  {element.type === 'text' && (
                    <div className="border-2 border-detective-text bg-white p-3 text-sm">
                      {element.content}
                    </div>
                  )}
                  {element.type === 'image' && (
                    <img
                      src={element.content}
                      alt=""
                      className="h-full w-full border-2 border-detective-text object-cover"
                    />
                  )}
                </div>
              ))}

              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-detective-text-secondary">
                    <Image className="mx-auto mb-4 h-20 w-20 opacity-30" />
                    <p className="text-lg">Comienza agregando elementos</p>
                    <p className="text-sm">para crear tu collage de prensa</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
