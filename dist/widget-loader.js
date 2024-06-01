(function() {
    const script = document.createElement('script');
    script.src = 'https://chat-app-28pv.onrender.com/dist/chat-widget.js';
    script.onload = function() {
      const container = document.createElement('div');
      container.id = 'chat-widget-container';
      document.body.appendChild(container);
  
      console.log('ChatWidget:', ChatWidget); // Verificar si ChatWidget está definido
      console.log('renderChatWidget:', ChatWidget.renderChatWidget); // Verificar si renderChatWidget está definido
  
      if (typeof ChatWidget.renderChatWidget === 'function') {
        ChatWidget.renderChatWidget(container);
      } else {
        console.error('ChatWidget.renderChatWidget is not a function');
      }
    };
    document.head.appendChild(script);
  })();
  