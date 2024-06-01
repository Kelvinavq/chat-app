(function() {
    const widgetUrl = 'https://digitalvibra.com/ferreacevalca';
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
  