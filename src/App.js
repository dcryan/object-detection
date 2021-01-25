import { useEffect, useRef } from 'react'

import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

import './App.css';

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let interval;
    (async function() {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      const video = videoRef.current
      video.srcObject = stream;
      video.onloadedmetadata = () => video.play();

      // Load the model.
      const model = await cocoSsd.load();

      interval = setInterval(async () => {
        // Classify the image.
        const predictions = await model.detect(video);

        console.log('Predictions: ');
        console.log(predictions);

        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.font = '10px Arial';


        predictions.forEach(prediction => {
          context.beginPath();
          context.rect(...prediction.bbox);
          context.lineWidth = 1;
          context.strokeStyle = 'green';
          context.fillStyle = 'green';
          context.stroke();
          context.fillText(
            prediction.score.toFixed(3) + ' ' + prediction.class, prediction.bbox[0],
            prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
        });
      }, 500);

    })()

    return () => interval.clear();
  }, [canvasRef])

  return (
    <div className="App">
      <div className="container">
        <video ref={videoRef}  muted playsInline autoPlay />
        <canvas id="canvas" ref={canvasRef} height={window.innerHeight} width={window.innerWidth}/>
      </div>
    </div>
  );
}

export default App;
