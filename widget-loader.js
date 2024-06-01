(function() {
  const widgetUrl = '/bubble-chat-widget.umd.js'; // Ruta del archivo generado por Vite
  const script = document.createElement('script');
  script.src = widgetUrl;
  script.onload = () => {
    const BubbleChatWidget = window.BubbleChatWidget;
    const container = document.createElement('div');
    container.id = 'bubble-chat-widget-container';
    document.body.appendChild(container);

    // Inicializa el widget
    ReactDOM.render(
      React.createElement(BubbleChatWidget),
      document.getElementById('bubble-chat-widget-container')
    );
  };
  document.head.appendChild(script);
})();
