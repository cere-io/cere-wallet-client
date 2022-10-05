export const downloadSvg = (svg: SVGElement, downloadName: string) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx!.drawImage(img, 0, 0);

    const pngFile = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');

    downloadLink.download = downloadName;
    downloadLink.href = `${pngFile}`;
    downloadLink.click();
  };

  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBuffer = Buffer.from(svgData);

  img.src = `data:image/svg+xml;base64,${svgBuffer.toString('base64')}`;
};
