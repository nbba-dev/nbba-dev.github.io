# Changelog

## 1.2.0 — Jun 2022

### New Features
- TODO - allow MVP roll and register that
- Pause button over delay overlay, so that you can now pause the game even during a delay

### Bugfixes
- Guided matches
  - TODO - Fix fan factor update when it is a tie
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