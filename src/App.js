import React, { Component } from 'react';
import BotUI from '@chentsulin/react-botui';
import 'botui/build/botui.min.css';
import 'botui/build/botui-theme-default.css';

import BrowserBot from './BrowserBot';
import BottenderApp from './BottenderApp';
import introMsg from './utils/introMsg';

import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    // sets intro message
    this.state = introMsg;

    const bot = new BrowserBot({ 
        client: {
          sendText: (msg) => {
            this.setState({ messages: [...this.state.messages, msg] });
          },

          sendAttachment: (attachment) => {
            this.setState({ messages: [...this.state.messages, attachment] });
          },

          sendAction: (action) => {
            const messages = [...this.state.messages];
            messages.pop();
            this.setState({ messages: messages, action });
          },

          resetMessages: () => {  
            this.setState({ messages: [], action: null });
          },
        },
    });

    bot.onEvent(BottenderApp);
    this.bot = bot;
  }

  handleAction = (res) => {

    // new message for the botui
    let valueToShow = '';
    if (res.type === 'button') valueToShow = res.text
    if (res.type === 'text') valueToShow = res.value

    this.setState({
      messages: [
        ...this.state.messages, // keeps old messages on the interface
        // show new user message
        {
          human: true,
          content: valueToShow,
        },
      ],
      action: null // cleans up any leftover action
    });

    const requestHandler = this.bot.createRequestHandler();

    requestHandler({ message: res });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <BotUI
            messages={this.state.messages}
            action={this.state.action}
            onAction={this.handleAction}
          />
        </header>
      </div>
    );
  }
}

export default App;
