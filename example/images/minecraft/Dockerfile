# This is a very basic Dockerfile for Minecraft.  There are better
# ones out there, I just wanted to demonstrate building a Docker
# container.

FROM java:7

RUN wget https://s3.amazonaws.com/Minecraft.Download/versions/1.7.10/minecraft_server.1.7.10.jar

CMD java -jar minecraft_server.1.7.10.jar

EXPOSE 25565

