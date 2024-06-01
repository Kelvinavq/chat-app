import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Esta línea es importante, asegúrate de que apunte a la carpeta correcta
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.jsx'), // Ajusta esta ruta según la ubicación de tu punto de entrada principal
        // Otros puntos de entrada si los tienes
      },
      output: {
        entryFileNames: '[name].[hash].js', // Cambia el nombre del archivo de salida si es necesario
        chunkFileNames: '[name].[hash].js', // Cambia el nombre del archivo de fragmento si es necesario
        assetFileNames: '[name].[hash].[ext]', // Cambia el nombre del archivo de activo si es necesario
      },
    },
  },
});
