const TAG = "[scheduler]";

export const schedule = (shifts, workers) => new Promise((resolve, reject) => {
    console.log(TAG, 'started');
    
    shifts.sort((a, b) => a.start.getTime() - b.start.getTime());

    let shiftsWithMissing = [];

    shifts.forEach((shift, index) => {
        console.log(TAG, `scheduling shift ${index} from ${shift.start.toLocaleString()} to ${shift.end.toLocaleString()} with ${shift.neededWorkers} workers`);

        workers.sort((a, b) => a.getDispatchingPriority(shift) - b.getDispatchingPriority(shift));

        for (let i = 0; i < shift.neededWorkers; i++) {
            let worker = workers.find(w => w.isAvailableFor(shift));
            if (worker) {
                shift.workers.push(worker);
                worker.workedShifts.push(shift);
            } else {
                console.error(TAG, `Not enough workers for shift ${shift.start.toLocaleString()}`);
                //shift.workers.push({ name: 'MISSING' });
                shiftsWithMissing.push(shift);
            }
        }

        console.log(TAG, `Shift ${index} is worked by ${shift.workers.map(w => w.name).join(',')}`);

    });

    console.log(TAG, 'Summary:');
    console.table(workers.map(w => ({ name: w.name, shifts: w.workedShifts.length })));

    if (shiftsWithMissing.length > 0) {
        console.error(TAG, `Missing slots in ${shiftsWithMissing.length} shifts`);
        console.table(shiftsWithMissing.map(s => s.start.toLocaleString()));
        reject(shiftsWithMissing.length)
    } else {
        console.log(TAG, 'complete');
        resolve();
    }
});
