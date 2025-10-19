export function useDownloadQr() {
  const downloadQr = async (imageUrl: string, fileName: string) => {
    try {
      const response = await fetch(imageUrl, { cache: "no-cache" });
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("QR download failed:", err);
    }
  };

  return { downloadQr };
}
