import logo from './logo.svg';
import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { createBraintreeClient, startApplePaySession } from './braintree-functions';

function App() {

  const [client, setClient] = useState({});

  useEffect(() => {
    async () => {
      const clientToken = await fetch(
        {
          url: "https://applepayintegraionapiserver.azurewebsites.net/clientToken/user/anonymous",
          method: "POST"
        }).text()
      const client = createBraintreeClient(clientToken);
      setClient(client);
    }
  }, []);

  const promptApplePayPurchase = useCallback((braintreeClientInstance) => {
    startApplePaySession(braintreeClientInstance);
  })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <div onClick={promptApplePayPurchase} id="applePayButton" className="btn-center apple-pay-button-with-text apple-pay-button-white-with-text">
          <span className="text">Buy with</span>
          <span className="logo"></span>
        </div>
      </header>
    </div>
  );
}

export default App;
