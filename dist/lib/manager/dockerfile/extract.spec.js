"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const extract_1 = require("./extract");
const d1 = fs_1.readFileSync('lib/manager/dockerfile/__fixtures__/Dockerfile1', 'utf8');
describe('lib/manager/dockerfile/extract', () => {
    describe('extractPackageFile()', () => {
        it('handles no FROM', () => {
            const res = extract_1.extractPackageFile('no from!');
            expect(res).toBeNull();
        });
        it('handles naked dep', () => {
            const res = extract_1.extractPackageFile('FROM node\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('is case insensitive', () => {
            const res = extract_1.extractPackageFile('From node\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles tag', () => {
            const res = extract_1.extractPackageFile('FROM node:8.9.0-alpine\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles digest', () => {
            const res = extract_1.extractPackageFile('FROM node@sha256:eb85fc5b1198f5e1ec025ea07586bdbbf397e7d82df66c90d7511f533517e063\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles tag and digest', () => {
            const res = extract_1.extractPackageFile('FROM node:8.9.0@sha256:eb85fc5b1198f5e1ec025ea07586bdbbf397e7d82df66c90d7511f533517e063\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles from as', () => {
            const res = extract_1.extractPackageFile('FROM node:8.9.0-alpine as base\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles comments', () => {
            const res = extract_1.extractPackageFile('# some comment\n# another\n\nFROM node\n')
                .deps;
            expect(res).toMatchSnapshot();
        });
        it('handles custom hosts', () => {
            const res = extract_1.extractPackageFile('FROM registry2.something.info/node:8\n')
                .deps;
            expect(res).toMatchSnapshot();
        });
        it('handles custom hosts and suffix', () => {
            const res = extract_1.extractPackageFile('FROM registry2.something.info/node:8-alpine\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles custom hosts with port', () => {
            const res = extract_1.extractPackageFile('FROM registry2.something.info:5005/node:8\n').deps;
            expect(res).toMatchSnapshot();
            expect(res[0].depName).toEqual('registry2.something.info:5005/node');
            expect(res[0].currentValue).toEqual('8');
        });
        it('handles custom hosts with port without tag', () => {
            const res = extract_1.extractPackageFile('FROM registry2.something.info:5005/node\n').deps;
            expect(res).toMatchSnapshot();
            expect(res[0].depName).toEqual('registry2.something.info:5005/node');
        });
        it('handles namespaced images', () => {
            const res = extract_1.extractPackageFile('FROM mynamespace/node:8\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles custom hosts with namespace', () => {
            const res = extract_1.extractPackageFile('FROM registry2.something.info/someaccount/node:8\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles abnormal spacing', () => {
            const res = extract_1.extractPackageFile('FROM    registry.allmine.info:5005/node:8.7.0\n\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('extracts multiple FROM tags', () => {
            const res = extract_1.extractPackageFile('FROM node:6.12.3 as frontend\n\n# comment\nENV foo=bar\nFROM python:3.6-slim\n').deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(2);
        });
        it('skips scratches', () => {
            const res = extract_1.extractPackageFile('FROM scratch\nADD foo\n');
            expect(res).toBeNull();
        });
        it('skips named multistage FROM tags', () => {
            const res = extract_1.extractPackageFile('FROM node:6.12.3 as frontend\n\n# comment\nENV foo=bar\nFROM frontend\n').deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(1);
        });
        it('handles COPY --from', () => {
            const res = extract_1.extractPackageFile('FROM scratch\nCOPY --from=gcr.io/k8s-skaffold/skaffold:v0.11.0 /usr/bin/skaffold /usr/bin/skaffold\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('skips named multistage COPY --from tags', () => {
            const res = extract_1.extractPackageFile('FROM node:6.12.3 as frontend\n\n# comment\nENV foo=bar\nCOPY --from=frontend /usr/bin/node /usr/bin/node\n').deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(1);
        });
        it('skips index reference COPY --from tags', () => {
            const res = extract_1.extractPackageFile('FROM node:6.12.3 as frontend\n\n# comment\nENV foo=bar\nCOPY --from=0 /usr/bin/node /usr/bin/node\n').deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(1);
        });
        it('detects ["stage"] and ["final"] deps of docker multi-stage build.', () => {
            const res = extract_1.extractPackageFile('FROM node:8.15.1-alpine as skippedfrom\nFROM golang:1.7.3 as builder\n\n# comment\nWORKDIR /go/src/github.com/alexellis/href-counter/\nRUN go get -d -v golang.org/x/net/html  \nCOPY app.go    .\nRUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .\n\nFROM alpine:latest  \nRUN apk --no-cache add ca-certificates\nWORKDIR /root/\nCOPY --from=builder /go/src/github.com/alexellis/href-counter/app .\nCMD ["./app"]\n').deps;
            expect(res).toMatchSnapshot();
            const passed = [
                res[2].depType === 'final',
                res[1].depType === 'stage',
                res[0].depType === 'stage',
            ].every(Boolean);
            expect(passed).toBe(true);
        });
        it('extracts images on adjacent lines', () => {
            const res = extract_1.extractPackageFile(d1).deps;
            expect(res).toMatchSnapshot();
            expect(res).toHaveLength(2);
        });
        it('handles calico/node', () => {
            const res = extract_1.extractPackageFile('FROM calico/node\n').deps;
            expect(res).toMatchSnapshot();
        });
        it('handles ubuntu', () => {
            const res = extract_1.extractPackageFile('FROM ubuntu:18.04\n').deps;
            expect(res).toMatchSnapshot();
        });
    });
    describe('getDep()', () => {
        it('rejects null', () => {
            expect(extract_1.getDep(null)).toMatchSnapshot();
        });
    });
});
//# sourceMappingURL=extract.spec.js.map