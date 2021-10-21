import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import { userRouter, placeRouter, photoRouter, registerRouter, staticRouter } from "./routes";
import * as config from './config';
import { doHealthCheck } from "./utils/healthCheck";
import { configureAuthentication } from "./routes/auth"
import { RequiresAuthentication } from "./middleware";

const app = express();

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
//app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      'default-src': ["'self'"],
      'base-uri': ["'self'"],
      'block-all-mixed-content': [],
      'font-src': ["'self'", 'https:', 'data:'],
      'frame-ancestors': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'object-src': ["'none'"],
      'script-src': ["'self'", 'https://js.arcgis.com',"'unsafe-eval'"], // added https to accomodate esri components?
      'script-src-attr': ["'none'"],
      'style-src': ["'self'", 'https:', "'unsafe-inline'"],
      'worker-src': ["'self'", 'blob:'],
      'connect-src': ["'self'", 'https://js.arcgis.com','https://services.arcgisonline.com']
    },
  })
);

// very basic CORS setup
app.use(cors({
  origin: config.FRONTEND_URL,
  optionsSuccessStatus: 200,
  credentials: true
}));

configureAuthentication(app);

app.get("/api/healthCheck", (req: Request, res: Response) => {
  doHealthCheck(res);
});

app.use("/api/user", RequiresAuthentication, userRouter);
app.use("/api/place", RequiresAuthentication, placeRouter);
app.use("/api/photo", RequiresAuthentication, photoRouter);
app.use("/api/register", registerRouter);
app.use("/api", RequiresAuthentication, staticRouter);

// serves the static files generated by the front-end
app.use(express.static(path.join(__dirname, 'web')));

// if no other routes match, just send the front-end
app.use((req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'web') + "/index.html")
})

app.listen(config.API_PORT, () => {
  console.log(`API listenting on port ${config.API_PORT}`);
});
