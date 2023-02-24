// import React, { useState } from "react";

// interface stopwatchprops {
//   start: boolean;
//   time: number;
//   setTime: React.Dispatch<React.SetStateAction<number>>;
// }

// export function StopWatch(props: stopwatchprops) {
//   const [isActive, setIsActive] = useState(false);
//   const [isPaused, setIsPaused] = useState(true);
//   //   const [time, setTime] = useState(0);

//   React.useEffect(() => {
//     if (props.start) {
//       resetStopwatch();
//       startStopwatch();
//     } else {
//       stopStopwatch();
//     }
//   }, [props.start]);

//   React.useEffect(() => {
//     let interval = 0;

//     if (isActive && isPaused === false) {
//       interval = window.setInterval(() => {
//         props.setTime(props.time + 10);
//       }, 10);
//     } else {
//       window.clearInterval(interval);
//     }
//     return () => {
//       window.clearInterval(interval);
//     };
//   }, [isActive, isPaused]);

//   const startStopwatch = () => {
//     setIsActive(true);
//     setIsPaused(false);
//   };

//   const resetStopwatch = () => {
//     props.setTime(0);
//   };

//   const stopStopwatch = () => {
//     setIsActive(false);
//   };

//   //   return (
//   //     <div className="stop-watch">
//   //       <p>{Math.floor(time / 1000)}</p>
//   //     </div>
//   //   );
// }

// // export StopWatch;

class Timer {
  callback: () => void;
  delay: number;
  timerId: number | null;

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this.delay = delay;
    this.timerId = null;
    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  start() {
    if (!this.timerId) {
      this.timerId = window.setTimeout(() => {
        this.callback();
        this.timerId = null;
      }, this.delay);
    }
  }

  stop() {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }
}

export default Timer;
