import CanvasContainer from './components/CanvasContainer';
import ControllerContainer from './components/ControllerContainer';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white p-4">
        <h1 className="text-3xl font-semibold">R24 Technical Task</h1>
      </header>

      {/* Main Content */}
      <main className="responsive-grid w-full">
        <CanvasContainer />
        <ControllerContainer />
      </main>
    </div>
  );
}
