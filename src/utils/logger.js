import winston  from "winston";
import winstonDaily from "winston-daily-rotate-file";
import path from "path";
import appRoot from "app-root-path";
import morgan from 'morgan';

//환경에 따라 로그 레벨 다름
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logDir = path.join(appRoot.path, 'logs');

// 일반적인 로그 관리
const logger = winston.createLogger({
    level: logLevel, //dev: debug, prod: info
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
    ),
    transports: [
        //개발환경
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(info => `${info.level}: ${info.message}`)
            ),
            level: logLevel,
        }),

        //배포환경
        new winstonDaily({
            level: logLevel,
            datePattern: 'YYYY-ww', //주 단위 회전
            dirname: logDir,
            filename: 'application-%DATE%.log',  
            zippedArchive: true,  
            maxSize: '20m',  //파일 최대 크기
            maxFiles: '2w',  //파일 보관 기간
        })
    ]
}); 

//스트림 설정 (winston연결)
const stream = {
    write: message => {
        logger.info(message.trim());
    }
};

//morgan 미들웨어 (개발 환경에서만 작동)
const morganMiddleware = process.env.NODE_ENV === 'dev' 
    ? morgan('tiny', { stream }) 
    : (req, res, next) => next();


//특정 로그 관리(클럽추가요청, 유저탈퇴요청 등)
const specificLogger = winston.createLogger({
    level: logLevel, 
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(info => `${info.level}: ${info.message}`)
            )
        }),

        new winstonDaily({
            datePattern: 'YYYY-MM',  //월 단위로 회전
            dirname: logDir,  
            filename: 'specific-%DATE%.log',  
            zippedArchive: true,  
            maxSize: '10m',  
            maxFiles: '1m',  
        })
    ]
}); 

export { logger, specificLogger, morganMiddleware };
