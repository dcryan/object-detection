import { useEffect, useRef, useState } from 'react'

import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

import { IconButton, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText } from '@material-ui/core';
import VideocamIcon from '@material-ui/icons/Videocam';

import './App.css';

function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const foundDevices = await navigator.mediaDevices.enumerateDevices()
      const filteredDevices = foundDevices.filter((device => device.kind === 'videoinput'));
      setDevices(filteredDevices);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const constraint = selectedDevice? { video: { deviceId: selectedDevice }} : {video: true};

      const stream = await navigator.mediaDevices.getUserMedia(constraint);

      const video = videoRef.current
      video.srcObject = stream;
    })();
  }, [selectedDevice, videoRef]);

  useEffect(() => {
    let interval;
    (async function() {
      const model = await cocoSsd.load();

      interval = setInterval(async () => {
        const video = videoRef.current
        const predictions = await model.detect(video);

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
      }, 100);

    })()

    return () => clearInterval(interval);
  }, [canvasRef])

  return (
    <div className="App">
      <div className="container">
        <video ref={videoRef}  muted playsInline autoPlay />
        <canvas id="canvas" ref={canvasRef} height={window.innerHeight} width={window.innerWidth}/>

        <IconButton id="button" onClick={() => setDialogOpen(true)}>
          <VideocamIcon/>
        </IconButton>
      </div>


      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Select Video</DialogTitle>
        <DialogContent>
          <List>
            {devices.map(device => (
              <ListItem
                button
                key={device.deviceId}
                onClick={() => {
                  setDialogOpen(false);
                  setSelectedDevice(device.deviceId);
                }}
              >
                <ListItemText primary={device.label} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
