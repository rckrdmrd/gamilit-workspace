export const fetchTribunal = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return (await import('./tribunalOpinionesMockData')).mockTribunal;
};
