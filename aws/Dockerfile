FROM python:3

RUN apt update
RUN apt install -y man
RUN pip install awscli-local[ver1]

ENTRYPOINT [ "awslocal" ]

CMD [ "help" ]
