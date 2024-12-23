import React from 'react';
import ConversationTimeline from './components/ConversationTimeline';


const dummySegments = [
  {
      "startTime": 0.8184375,
      "endTime": 3.4171875,
      "text": "Thank you for calling Martha's Flores, town assist you.",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 3.7884375000000006,
      "endTime": 7.2815625,
      "text": "Hello, I'd like to order flowers and I think you have what I'm looking for.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 7.7709375000000005,
      "endTime": 10.6396875,
      "text": "I'd be happy to take care of your order, may have your name please.",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 11.129062500000003,
      "endTime": 12.006562500000001,
      "text": "Randall Thomas.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 12.563437500000003,
      "endTime": 14.976562500000004,
      "text": "Randall Thomas, can you spell that for me?",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 15.5503125,
      "endTime": 16.0396875,
      "text": "Randall,",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 16.478437500000002,
      "endTime": 17.4234375,
      "text": "R-A-N-D-A-L-L,",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 19.5496875,
      "endTime": 20.0559375,
      "text": "Thomas.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 20.6128125,
      "endTime": 22.0134375,
      "text": "Thank",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 22.7896875,
      "endTime": 27.2109375,
      "text": "you for that information Randall. May have your home or office number area code first.",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 34.3659375,
      "endTime": 40.727812500000006,
      "text": "That's 409-866-5088. Do you have a fax number or email address?",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 41.2003125,
      "endTime": 42.533437500000005,
      "text": "My email is",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 43.0903125,
      "endTime": 44.0353125,
      "text": "RandallThomasatgmail.com",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 46.93781250000001,
      "endTime": 51.730312500000004,
      "text": "RandallThomasatgmail.com May have your shipping address?",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 51.98343750000001,
      "endTime": 52.94531250000001,
      "text": "6800,",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 54.362812500000004,
      "endTime": 55.27406250000001,
      "text": "Batters Avenue,",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 56.10093750000001,
      "endTime": 57.26531250000001,
      "text": "Fulmont,",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 58.159687500000004,
      "endTime": 58.902187500000004,
      "text": "Texas, lift code 7706",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 61.58531250000001,
      "endTime": 61.60218750000001,
      "text": "Gladys",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 61.60218750000001,
      "endTime": 66.4790625,
      "text": "Avenue Beaumont, Texas ZIP Code 77706.",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 66.8840625,
      "endTime": 70.56281249999999,
      "text": "Thank you for the information. What products were you interested in purchasing?",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 71.2040625,
      "endTime": 72.9928125,
      "text": "Red roses, probably a dozen.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 74.0221875,
      "endTime": 76.6715625,
      "text": "One dozen of red roses, do you want long stems?",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 76.7221875,
      "endTime": 77.2115625,
      "text": "Sure.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 77.7178125,
      "endTime": 81.1265625,
      "text": "Alright, Randall, let me process your order. One moment please.",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 82.5440625,
      "endTime": 82.8309375,
      "text": "Okay.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 85.1428125,
      "endTime": 93.8840625,
      "text": "Randomly you're ordering one dozen long-stent red roses. The total amount of your order is $40 and it will be shipped to your address within 24 hours.",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 94.3228125,
      "endTime": 95.7403125,
      "text": "I was thinking of delivering my roses",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 96.0946875,
      "endTime": 96.5165625,
      "text": "again.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 96.9384375,
      "endTime": 98.2884375,
      "text": "Within 24 hours.",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 98.8453125,
      "endTime": 99.5371875,
      "text": "Okay, no problem.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 100.2290625,
      "endTime": 101.9165625,
      "text": "Is there anything else I can help you with?",
      "speaker": "Speaker 1",
      "channel": 0
  },
  {
      "startTime": 102.5071875,
      "endTime": 103.8234375,
      "text": "That's all for now, thanks.",
      "speaker": "Speaker 0",
      "channel": 0
  },
  {
      "startTime": 104.3803125,
      "endTime": 107.8565625,
      "text": "No problem, Rana. Thank you for calling Martha's Floor. Have a nice day.",
      "speaker": "Speaker 1",
      "channel": 0
  }
];

const duration = 180; // Total duration in seconds

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <ConversationTimeline segments={dummySegments} duration={duration} />
    </div>
  );
}
