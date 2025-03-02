import winston  from "winston";
import winstonDaily from "winston-daily-rotate-file";
import path from "path";
import appRoot from "app-root-path";

//환경에 따라 로그 레벨 다름
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logDir = path.join(appRoot.path, 'logs');

const Logger = winston.createLogger({
    leve: logLevel, //dev: debug, prod: info
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winstonDaily({
            level: logLevel,
            datePattern: 'YYYY-ww', //주 단위 회전
            dirname: logDir,
            filename: 'application-%DATE%.log',  
            zippedArchive: true,  
            maxSize: '20m',  //파일 최대 크기
            maxFiles: '2w',  //파일 보관 기간
        }),
    ]
}); // 일반적인 로그 관리

const specificLogger = winston.createLogger({
    level: 'info', 
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(info => `${info.timestamp} [${info.level}]: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),

        new winstonDaily({
            level: 'info', 
            datePattern: 'YYYY-MM',  //월 단위로 회전
            dirname: logDir,  
            filename: 'specific-%DATE%.log',  
            zippedArchive: true,  
            maxSize: '10m',  
            maxFiles: '1m',  
        })
    ]
}); //특정 로그 관리(클럽추가요청, 유저탈퇴요청 등)

export { Logger, specificLogger };
