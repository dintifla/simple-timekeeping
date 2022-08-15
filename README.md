# simple-timekeeping

Simple time keeping to be used on two computers

## Intro

This application is used to measure times of a race, where start and finish is not at the same location.
Best is if the race has interval starts. E.g. a cycling hill climb.

## How to use

### Register participants

1. Start `startliste.html` to register participants by name
2. Click "New" to start a new list. Any previous list will be exported as backup
3. Click "Load" if you need to reload from local storage (e.g. if the browser was closed). The storage is updated after each manipulation
4. Export once finished, or to make a backup
5. Select a file to continue on an existing list

At the end of an export, there are 20 spare places to be used for late registrations. The spares are set as "male".

### Measure times

1. Start `zeitmessung.html` (can be on different computers, due to start and finish not at the same location)
   1. once for the starting times: select "Start" in the dropdown
   2. once for the finishing times: select "Ziel" in the dropdown
2. Select the participant list which was exported in the previous section
3. Click to capture start/finish time for the given number plate. If there is a mistake, times can be edited manually
4. Click export to safe the results to a `.json`-file once done, or to make a backup

- Click "Load" if you need to reload from local storage (e.g. if the browser was closed). The storage is updated after each manipulation
- With the file selection it is also possible to load a backup of already registered times instead of the participant list

### Evaluate results

Once all participants are registered at the start and finished and both files are present. Proceed like this:

1. Correct the gender in the "Start" file if some of the spares were female (set `gender: "F"`)
2. Start `zeitmessungAuswertung.html`
3. Import start- and finishing time files (the ones generated above)
4. Click "Evaluate" ("Auswerten")
5. See the result table as well the exported results as `.json` and `.csv`

## Possible improvements

- Export results in more file formats
- Save to (cloud) database instead of files
- Better, more consistent styling
- Automated testing
- Better handling of female spares
