/*
 * metrics.js
 * Author: Michael Friedman
 *
 * Some tools for gathering performance metrics. Namely a timer.
 */

/******************************************************************************/

// Timer

/*
 * Starts and returns a new timer. Counts in milliseconds. (Timers can only be
 * used once. You have to make a new timer to time more than once.)
 */
function Timer() {

    // Start time in milliseconds since Jan 1 1970.
    this.startTime;

    // Start time for the current lap. Updated on every call to a startTime() or
    // recordLap().
    this.lapStartTime;

    // Times are times since the timer was started.
    this.recordedTimes = [];

    // Laps are times since the *last* time a startTimer() or recordLap()
    // was called.
    this.recordedLaps = [];

    // Indicates whether the timer is finished running.
    this.isDone = false;


    // Start the timer
    this.startTime = new Date().getTime();
    this.lapStartTime = this.startTime;

    /*
     * Records the time since the timer was started. Returns that time.
     */
    this.recordTime = function() {
        if (this.isDone) {
            throw new Error('Timer is stopped! Make a new timer to record more.');
        }

        let newTime = new Date().getTime();
        let diff = newTime - this.startTime;
        this.recordedTimes.push(diff);
        return diff;
    };


    /*
     * Records the time since the last lap was started. Returns that time.
     */
    this.recordLap = function() {
        if (this.isDone) {
            throw new Error('Timer is stopped! Make a new timer to record more.');
        }

        let newTime = new Date().getTime();
        let diff = newTime - this.lapStartTime;
        this.recordedLaps.push(diff);
        this.lapStartTime = newTime;
        return diff;
    };

    /*
     * Stops/destroys the timer. Returns the obj:
     *   {recordedTimes: [...], recordedLaps: [...]}
     * Note that this does *not* record the final time. You do that with a
     * final call to recordTime() or recordLap() before calling this.
     */
    this.stop = function() {
        if (this.isDone) {
            throw new Error('Timer is stopped! Make a new timer to record more.');
        }

        // Stop
        this.isDone = true;

        return {recordedTimes: this.recordedTimes, recordedLaps: this.recordedLaps};
    };
}

module.exports = {
    Timer
};




