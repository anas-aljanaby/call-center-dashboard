export default function Home() {
  const sampleInteractions = [
    { type: 'agent', startTime: 0, duration: 30, label: 'Call Opening - Sales' },
    { type: 'customer', startTime: 15, duration: 10, label: 'Customer Response' },
    // Add more interactions as needed
  ];

  return (
    <div style={{ padding: '20px' }}>
      <AudioPlayer
        audioUrl="/path-to-your-audio.mp3"
        interactions={sampleInteractions}
        totalDuration={183} // 3:03 minutes in seconds
      />
    </div>
  );
} 