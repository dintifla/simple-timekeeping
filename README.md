# simple-timekeeping

Simple time keeping to be used on two computers

## Intro

This application is used to measure times of a race, where start and finish is not at the same location.
Best is if the race has interval starts. E.g. a cycling hill climb.

## How to use

### Measure times

1. Start `zeitmessung.html` (can be on different computers, due to start and finish not at the same location)
   1. once for the starting times: select "Start" in the dropdown
   2. once for the finishing times: select "Ziel" in the dropdown
2. In each application specify the same number of participants ("Teilnehmer")
3. Click "New" ("Neu") to create the measurement table
4. Click to capture start/finish time for the given number plate. If there is a mistake, times can be edited manually
5. Click export to safe the results to a `.json`-file

### Evaluate results

Once all participants are registered at the start and finished and both files are present. Proceed like this:

1. Start `zeitmessungAuswertung.html`
2. Import start- and finishing time files (the ones generated above)
3. Click "Evaluate" ("Auswerten")
4. See the result table as well the exported results as `.json`

## Possible improvements

- Export results in different formats
- Capture rider names in addition to number plate. This would facilitate the result list
- Better, more consistent styling
- Automated testing