import express from 'express';

const app  = express();
const PORT = process.env.PORT || 3000;

/* ----------  ROUTE THAT GENERATES THE SCREEN  ---------- */
app.get('/color-buttons', (_, res) => {
  res.send(/* html */`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Color Button Screen</title>
      <style>
        :root {
          --blue:  #0018ff;
          --red:   #ff0000;
          --green: #007200;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100vh;
          background: #e8eaed;           /* light-gray backdrop */
          font-family: Arial, Helvetica, sans-serif;
        }

        /* ----------  Top horizontal button row  ---------- */
        .top-buttons {
          display: flex;
          width: 100%;
        }
        .top-buttons button {
          flex: 1;
          padding: 14px 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          border: none;
          cursor: pointer;
        }
        .top-buttons .blue   { background: var(--blue); }
        .top-buttons .red    { background: var(--red);  }
        .top-buttons .green  { background: var(--green);}

        /* ----------  Headline  ---------- */
        h1 {
          text-align: center;
          font-size: 2.3rem;
          font-weight: 700;
        }

        /* ----------  Bottom vertical button stack ---------- */
        .bottom-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 0 4%;
          margin-bottom: 40px;           /* lift stack off very bottom */
        }
        .bottom-buttons button {
          padding: 14px 0;
          font-size: 1.3rem;
          font-weight: 700;
          color: #fff;
          border: none;
          cursor: pointer;
        }
        .bottom-buttons .blue  { background: var(--blue); }
        .bottom-buttons .red   { background: var(--red);  }
        .bottom-buttons .green { background: var(--green);}
      </style>
    </head>

    <body>
      <!-- top row -->
      <div class="top-buttons">
        <button class="blue">BLUE BUTTON</button>
        <button class="red">RED BUTTON</button>
        <button class="green">GREEN BUTTON</button>
      </div>

      <!-- headline -->
      <h1>Write the code for this screen</h1>

      <!-- bottom stack -->
      <div class="bottom-buttons">
        <button class="blue">BLUE BUTTON</button>
        <button class="red">RED BUTTON</button>
        <button class="green">GREEN BUTTON</button>
      </div>
    </body>
    </html>
  `);
});
/* -------------------------------------------------------- */

app.listen(PORT, () =>
  console.log(`✅  Server running at http://localhost:${PORT}/color-buttons`)
);
