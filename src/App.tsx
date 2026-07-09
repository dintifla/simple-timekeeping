import { useState } from 'react';
import { StartList } from './components/StartList';
import { Timekeeping } from './components/Timekeeping';
import { Evaluation } from './components/Evaluation';
import { Snackbar } from './components/Snackbar';

type DisplayTarget = 'startlist' | 'timekeeping' | 'evaluation';

export function App() {
  const [displayTarget, setDisplayTarget] = useState<DisplayTarget>('startlist');

  return (
    <>
      <h1>Zeitmessung</h1>
      <nav>
        <button onClick={() => setDisplayTarget('startlist')}>Startliste</button>
        <button onClick={() => setDisplayTarget('timekeeping')}>
          Zeitmessung
        </button>
        <button onClick={() => setDisplayTarget('evaluation')}>Auswertung</button>
      </nav>

      {displayTarget === 'startlist' && <StartList />}
      {displayTarget === 'timekeeping' && <Timekeeping />}
      {displayTarget === 'evaluation' && <Evaluation />}

      <Snackbar />
    </>
  );
}
