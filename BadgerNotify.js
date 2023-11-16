const nodemailer = require('nodemailer');

const apiUrl = 'https://public.enroll.wisc.edu/api/search/v1/enrollmentPackages/1244/266/026032';
let emailSent = false; // Flag to track if the email has been sent

// Function to print the current status of each section to the command line
function printStatus() {
    fetch(apiUrl, {
        method: 'GET',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        data.forEach(section => {
            const status = section.packageEnrollmentStatus.status;
            if ((status === 'OPEN' || status === 'WAITLISTED') && !emailSent) {
                console.log('CLASS IS ' + status);
                const shortDescription = section.sections[0].subject.shortDescription
                const catalogNumber = section.catalogNumber
                const sectionNumber  = section.sections[0].sectionNumber;
                sendEmail(status, shortDescription, catalogNumber, sectionNumber);
            }
        });
    })
    .catch(error => {
        // Handle errors during the fetch
        console.error('Fetch error:', error);
    });
}

// Function to send an email
async function sendEmail(status, shortDescription, catalogNumber, sectionNumber) {
    // Replace these values with your email configuration
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'user_email',
            pass: 'user_password',
        },
    });

    const mailOptions = {
        from: 'user_email',
        to: 'recipient_email',
        subject: `Class Status: ${status}`,
        text: `
        The class is now ${status}.
        Short Description: ${shortDescription}
        Catalog Number: ${catalogNumber}
        Section Number: ${sectionNumber}
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        emailSent = true; // Update the flag to indicate that the email has been sent
    } catch (error) {
        console.error('Email error:', error);
    }
}

// Function to generate a random delay between min and max minutes
function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min) * 60 * 1000;
}

// Function to run the script at a random interval
async function runScript() {
    const randomDelay = getRandomDelay(1, 5);
    console.log(`Next run in ${randomDelay / (60 * 1000)} minutes`);

    if (!emailSent) {
    setTimeout(async () => {
        console.log('Running script...');
        await printStatus();
            runScript();
    }, randomDelay);
    } else {
        console.log('Email has been sent. Exiting the script.');
        process.exit(0)
    }
}

// Start the script
runScript();
