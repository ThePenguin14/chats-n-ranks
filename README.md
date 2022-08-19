# Chats 'N' Ranks
Minecraft Script Behavior Pack Addon for setting chat formats. (changing from the default &lt;NAME&gt; MSG and putting in new info)
# About
A small script which includes ranks and setting chat formats. Currently no way to save settings and formats once world is left, there is no API feature to do this currently (I think?). I attempted to use score board display names to save a string but it had a 32-char limit and I don't think I could use binary because it might not allow just ANY character/byte and anyway that probably not even be big enough.
# Features
Has some basic features like displaying names and messages and muting specific players or even setting a minimum chat rank plus a ranking system, plus more.

More advanced info can be put in chat strings like a timestamp, player location, health, scores, finding a prefixed tag for titles, easier insertion of special characters from UTF16 hex, and (maybe) easier insertion of colors and formatting.
# How To
All commands use the `!` prefix. This guide won't include the `!` in commands but for example if you see `getadmintag` it should be entered in chat as `!getadmintag`. Note these commands can't be used in functions or command blocks or anything and can only be used in chat.

Now run
```
tag @s add admin
```
to give yourself admin. This is required for most commands and ensures only people you want to be able to make adjustments to these systems can. You can give this tag to as many people as you want. You can also set or get the admin tag with `getadmintag` or `setadmintag <newtag>`. Now run
```
!setuprank
```
to setup the ranking system. Now you'll notice if you chat it still looks the same. This is because the chat format defaults to:
```
<{name}> {msg}
```
(can be obtained by `getchatformat`) which is identical to the one used by Minecraft. Let's make a cool one. We can use `!setchatformat <format>`. I'll put
```
{name} {rank} [{hp}]: {msg}
```
this might be a little cluttered so you may want to pick and choose what info you want to display as just using a bunch of stuff looks bad and cluttered. Each of these fields can be looked at in the Field Index below but `{msg}` is where the message sent goes, `{name}` the person who sent it, `{hp}` the persons health, default max is 20, and `{rank}` where the rank goes. (This uses C#-like interpolation syntax.) How do ranks work?

A rank is a scoreboard objective, `mt_rank`. You can use
```
scoreboard players set <player> mt_rank <num>
```
to set someone's rank. Ranks start at 0. If there is no scoreboard set for a player it is assumed to be 0 by the chat script and may be automatically assigned a 0.

You can also promote someone with `promote <player>` or demote someone with `demote <player>`.

Right now if you chat the rank field just displays a 0, because it has not been assigned a name. You can name any rank value using:
```
!namerank <num> <name>
```
Let's name rank 0 Beginner and rank 1 Experienced
```
!namerank 0 Beginner
!namerank 1 Experienced
```
(These names do support silcrow formatting.) You can do these for as many and for select numbers as you want. You could theoretically not set any of them and only set 1000, and numbers would always be displayed until you hit 1000 and a string would be shown. Don't use this to just try and show a scoreboard value as there is a way to do this that doesn't interrupt against the rank system (`{score=OBJECTIVE}` shows a scoreboard value for the player).

Set a chat rank minimum with:
```
!setminchatrank <num>
```
This means your rank must be greater than or equal to the specified number to chat. If you are below the message will not send and it will send the player a message indicating they must be rank n to chat. It defaults to 0 which means that everyone can chat.

Mute someone with:
```
!mute <playername>
```
Or unmute them:
```
!unmute <playername>
```
If they save and quit they will be remembered as muted! All this does is add or remove a `mt_muted` tag so this is a shorthand but if you want to use a command block or function or something you can just adjust tags.
# Command Index
Unless it says "does not require admin" all commands require admin.

- `coords` - Tells whoever runs it their coords as a decimal. Admin not required.
- `credits` - Tells you A Teal Penguin made it. Admin not required.
- `demote <name>` - Removes 1 from the specified player's rank.
- `discardsave` - Discards a save state. Save states do not work.
- `getadmintag` - Puts the current admin tag in your chat. Admin not required.
- `getchatformat` - Puts the current chat format in your chat.
- `getminchatrank` - Gets the minimum rank require dto chat. Default is 0.
- `load` - Do not run. Save states do not work.
- `mute <playerName>` - Mutes a player by adding a `mt_muted` tag.
- `namerank <num> <name>` - Names a number rank a string. String can be anything and can be silcrow formatted (maybe make sure your chat format resets formats after ranks?).
- `promote <name>` - Adds 1 to the specified player's rank.
- `save` - Do not run. Save states do not work.
- `setadmintag <tagName>` - Sets the admin tag to something else.
- `setchatformat <format>` - Sets the chat format to a chat format. Check chat formats for more.
- `setminchatrank <num>` - Sets the minimum rank required to chat. Default is 0.
- `setuprank` - Creates rank scoreboard. You only ever need to run this once on a world.
- `unmute <playerName` - Unmutes a player by removing a `mt_muted` tag.
# Chat Format
Chat formats are structured like this `{field}`. When it is filled in with the info it will look like this `value` and the curly braces go away. If you want to actually use curly braces as text you can double up `{{` to ignore it. You only double up opening curlies and not closing ones. For example, to get a result like `{20}` from a chat format you would do `{{{hp}}`. The first two curly braces signal that you are not using a field and creates one curly brace, then the next one opens a field and gets the hp field and is then closed by the first curly brace. Then to get one closing curly brace you only put one since they cannot be escaped. Some fields have arguments and are formatted like this `{fieldname=argument}`.
## Field Index
- `char=HEX` - Inserts a character with a UTF16/ASCII code. HEX must be a hex code. This is equivalent to pasting in the character itself as this is not evaluated but just inserts the correct escape here.
- `color=COLOR` - Inserts the correct silcrow color formatting. COLOR must be [a name specified here in the "Name" column](https://minecraft.fandom.com/wiki/Formatting_codes#Color_codes). This is equivalent to using the silcrow formatting itself as this is not evaluated but just inserts the correct escape here.
- `hp` - The health of the player.
- `msg` - The message the player sent.
- `name` - The name of the player sending the message.
- `rank` - The rank of the player sending the message. The display text if one was given with `namerank` or if none is named displays the number.
- `score=OBJECTIVE` - The value of the player's score on the objective. If the player does not have a score on it it displays 0. OBJECTIVE is the objective name.
- `style=FORMAT` - Inserts the correct silcrow format formatting. FORMAT must be [a name specified here in the "Name" column](https://minecraft.fandom.com/wiki/Formatting_codes#Formatting_codes). This is equivalent to using the silcrow formatting itself as this is not evaluated but just inserts the correct escape here.
- `title=PREFIX` - Displays the "title" tag. Looks through the player's tags and returns the first one that has the specified prefix. If none are found returns an empty string. For example if you use the prefix `title_` then add the tag `title_Amazing` this will show "Amazing".
- `utc` - The time the message is sent using UTC (GMT) 24-hour time format.
- `x` - The x-coordinate of the player.
- `xf` - The x-coordinate of the player as a (likely very long) decimal. ("f" stands for float.)
- `y` - The y-coordinate of the player.
- `yf` - The y-coordinate of the player as a decimal. ("f" stands for float.).
- `z` - The z-coordinate of the player.
- `zf` - The z-coordinate of the player as a (likely very long) decimal. ("f" stands for float.).
