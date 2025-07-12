PROJECT SOLUTION

# TOOLS REQUIRED:
1. Amazon EC2 as our server
2. Nginx as our web server for hosting the front end and helping with reverse proxy (to avoid port conflict)
3. Node.js + Express for hosting the backend
4. S3 Bucket for storing booking data
5. Amazon SES for sending email notification 


# PROJECT STEPS

1. Create your S3 Bucket (nothing complicated)

2. Verify your email in Amazon SES as an Email Identity (Please maintain Sandbox and not production)

3. Lunch your EC2 instance
    i. Use Amazon linux 2 AMI (the default)
    ii.  Use a security group that allows SSH (22) and HTTP (80)
    iii. Attach an IAM Role with:
        - AmazonS3FullAccess
        - AmazonSESFullAccess

4. Connect to the EC2 instance via ssh (use any preferred method of your choice)

5. Install and Start Required Softwares:

sudo yum update -y

# Install Node.js 18
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install nginx
sudo amazon-linux-extras enable nginx1
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Install Git (if needed)
sudo yum install -y git

6. Set Up Project Directory

mkdir ~/booking-app && cd ~/booking-app

7. Create the project files (inpute the content of the file after you have properly edited)
    i. index.html (the booking form)
    ii. server.js

8. Initialize Node App and Install SDK v3

npm init -y
npm install express body-parser @aws-sdk/client-s3 @aws-sdk/client-ses cors

9. Run your node server (choose any option below) (though option 1 is preferrable when still developing)

    i. Option 1: in foreground (your terminal): sudo node server.js
    ii. Option 2: in background (behind terminal): sudo nohup node server.js > out.log 2>&1 &
    iii. Option 3: use pm2
            sudo npm install -g pm2
            pm2 start server.js
            pm2 save
            pm2 startup

10. Configure Nginx reverse Proxy (enabling nginx to talk to node.js)
# Run this command:
sudo nano /etc/nginx/nginx.conf
# Replace content with:

server {
    listen 80;
    server_name _;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    location /book {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;s
        proxy_cache_bypass $http_upgrade;
    }
}

# Run these commands:

sudo nginx -t
sudo systemctl restart nginx

11. Serve your frontend from Nginx
sudo cp index.html /usr/share/nginx/html/index.html

12. Run Step 9 again

13. Access your booking website and test it out using:
http://<EC2_PUBLIC_IP>/
