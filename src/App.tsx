import { GameProvider, useGame } from './contexts/GameContext';
import { MenuScreen } from './components/screens/MenuScreen';
import { CountdownScreen } from './components/screens/CountdownScreen';
import { GameScreen } from './components/screens/GameScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { TestScreen } from './components/screens/TestScreen';
import './styles/game.css';
import './styles/grid.css';
import './App.css';

function GameRouter() {
  const { state } = useGame();

  switch (state) {
    case 'menu':
      return <MenuScreen />;
    case 'countdown':
      return <CountdownScreen />;
    case 'playing':
      return <GameScreen />;
    case 'gameOver':
      return <GameOverScreen />;
    default:
      return <MenuScreen />;
  }
}

function App() {
  // Simple routing based on URL path
  const path = window.location.pathname;

  if (path === '/test') {
    return (
      <div className="app">
        <TestScreen />
      </div>
    );
  }

  return (
    <GameProvider>
      <div className="app">
        <GameRouter />
      </div>
    </GameProvider>
  );
}

export default App;
