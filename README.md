# Changelog

## Future updates
- Allow MVP roll and register that
- Automatic tests

## 1.3.0 — Jun 2022

### New Features
- Swap teams
  - A button has been added in the settings menu to swap the team names according to the table position

### Bugfixes
- Kickoff table
  - Renamed 1D3+3 for 1D3+1 in Sevens rules

## 1.2.0 — Jun 2022

### New Features
- Rework fan factor update calculation to fit the actual rules of BB7s
- Pause button over delay overlay, so that you can now pause the game even during a delay
- Center background so that the field is always center no matter the screen resolution

### Bugfixes
- Guided matches
  - Guided match does not work without skipping the intro
  - Couldn't select fan factor for team2
- Go back one turn
  - Fix bug that ocurred when going back one turn and kept a clock ticking in the background

---

## 1.1.0 — Feb 2022

### New Features
- Go back one turn
- Allow skipping fan factor update only on friendly games

### Bugfixes
- Guided matches
  - Correctly update initial fans, instead of continously increasing the fans number when modifying the roll
  - Skip pre-game now works

---

## 1.0.0 — Jan 2022

- Landing page
- League games
  - Pick one of your leagues
  - Pick the league match
  - Automatically upload the game record
- Configure friendly games
  - Write your own team names
  - Pick the time for each turn
  - Pick the turn delay
  - BB7s rules
  - Concede the game
- Guided game
  - Weather table
  - Inducements table
  - Kickoff table
  - Nuffle table
  - Guided rolls for events
    - Touchdowns
    - Pass
    - Injuries
  - Post-game
    - Earnings
    - Fame update


## How to run...

Open live server from VSCode

## How to deploy...

Just push new code to the master branch and wait a couple of minutes

## Caveats

In order to successfully login to the google sheets api in localhost, instead of navigating to `http://localhost:5501/`, navigate to `http://127.0.0.1:5501/`.

Not sure about this last one, just recently added `localhost:5001` as a valid URL for the Oauth credentials