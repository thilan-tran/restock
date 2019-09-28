# Restock Webapp

A real-time stock trading simulator webapp built using React, Flask, and websockets. Users can create a free account, simulate stock transactions such as buying long shares or selling short, and track stocks for real-time updates as the market develops. Every stock has detailed historical price statistics and users have access to their value and balance change history. Any changes in the user leaderboards or in a signed-in user''s purchased and tracked stocks will be automatically reflected in the frontend using websockets.

The deployed website on Heroku can be found [here](https://restock-app.herokuapp.com). The websocket functionality is not optimized because of limitations on the free developer version of Heroku.

*Development Checklist*:

- [ ] Convert backend timestamp to UTC.
- [ ] Fix overloaded timestamp charts.
- [ ] Improve websocket performance on Heroku.

![Stock View](https://imgur.com/AIIeAsh.png)

![Stock Leaderboard](https://imgur.com/BkhgQvO.png)

![User View](https://imgur.com/LrQqnbU.png)
