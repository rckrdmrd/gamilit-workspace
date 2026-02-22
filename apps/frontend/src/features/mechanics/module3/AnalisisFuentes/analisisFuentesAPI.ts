export const fetchSources = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return (await import('./analisisFuentesMockData')).mockSources;
};
