import React from "react";
import { X } from "lucide-react";

const PolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-orange-500">
            Terms of Use &ndash; RatchetUp
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-4 flex-1 space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-sm italic text-gray-600 dark:text-gray-400">
            This is a binding agreement and should be read in its entirety.
          </p>
          <p>
            By accessing or using the RatchetUp website, you acknowledge that
            you have read, understood, and agreed to be bound by these Terms
            &amp; Conditions. If you do not agree to these terms, please refrain
            from using the website.
          </p>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Account Registration and Security
            </h3>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials.
              </li>
              <li>
                You agree to provide accurate, current, and complete information
                during the registration process.
              </li>
              <li>
                RatchetUp reserves the right to suspend or terminate accounts
                that provide false information or violate these terms.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Intellectual Property
            </h3>
            <p>
              All content on the RatchetUp website, including text, graphics,
              logos, images, audio clips, and software, is the property of
              RatchetUp or its licensors and is protected by copyright,
              trademark, and other intellectual property laws. You may not
              reproduce, modify, distribute, or display any content from the
              website without the prior written consent of RatchetUp.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              User Conduct
            </h3>
            <p className="mb-2">
              By using the RatchetUp website, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <span className="font-semibold">
                  Comply with all applicable laws:
                </span>{" "}
                You will not use the website for any illegal or unauthorized
                purpose.
              </li>
              <li>
                <span className="font-semibold">Respect other users:</span> You
                will not engage in any behavior that is harmful, threatening,
                abusive, harassing, or discriminatory.
              </li>
              <li>
                <span className="font-semibold">Refrain from spamming:</span>{" "}
                You will not send unsolicited messages or spam to other users or
                through the website.
              </li>
              <li>
                <span className="font-semibold">Not impersonate others:</span>{" "}
                You will not create a false identity or impersonate any person or
                entity.
              </li>
              <li>
                <span className="font-semibold">
                  Not interfere with the website:
                </span>{" "}
                You will not attempt to gain unauthorized access to the website
                or its systems.
              </li>
              <li>
                <span className="font-semibold">Not use automated tools:</span>{" "}
                You will not use any automated tools or scripts to access or
                interact with the website.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Improper Use
            </h3>
            <p>
              Businesses that contradict Islamic values or promote activities or
              products that are considered offensive or harmful to Islamic values
              are prohibited in the global.
            </p>
            <p className="mt-2">
              The Terms of Use strictly prohibits employers and job-seekers from
              offering and accepting employment using RatchetUp's employment
              portal for business and employment that are prohibited in the global.
            </p>
            <p className="mt-2 mb-1">
              Here are some examples of businesses that are prohibited in the
              global:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <span className="font-semibold">Gambling and betting:</span>{" "}
                Casinos, betting shops, and related activities are strictly
                illegal in the global.
              </li>
              <li>
                <span className="font-semibold">
                  Narcotics and psychotropic substances:
                </span>{" "}
                The global has a zero-tolerance policy for drugs, and any business
                related to the production, sale, or consumption of illegal drugs
                is prohibited.
              </li>
              <li>
                <span className="font-semibold">
                  Alcohol and pork production:
                </span>{" "}
                While alcohol and pork products are available for consumption in
                certain areas of the global, their production and sale are strictly
                prohibited.
              </li>
              <li>
                <span className="font-semibold">
                  Human trafficking and pornography:
                </span>{" "}
                These activities are illegal and punishable by law.
              </li>
            </ul>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              It's important to note that this is not an exhaustive list, and
              specific regulations may vary depending on the Emirate. It's
              always advisable to consult with local authorities or legal experts
              before starting a business in the global to ensure compliance with
              all relevant laws and regulations.
            </p>
            <p className="mt-2">
              If RatchetUp determines that you have violated these rules of
              conduct, we may take any action we deem appropriate, including
              terminating your access to the website.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Scope of Services for RatchetUp
            </h3>
            <p className="mb-2">
              RatchetUp is an online platform designed to facilitate job
              search and recruitment in the Dubai region. Our services include:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <span className="font-semibold">Job Posting:</span> Employers
                can post job descriptions on our platform for a fee. This
                includes features such as job search visibility, applicant
                tracking, and communication tools.
              </li>
              <li>
                <span className="font-semibold">Resume Database:</span> Job
                seekers can create profiles and upload their resumes to our
                database. These profiles will be accessible to employers
                searching for qualified candidates.
              </li>
              <li>
                <span className="font-semibold">Job Matching:</span> Our
                platform utilizes advanced algorithms to match job seekers with
                suitable job openings based on their skills, experience, and
                preferences.
              </li>
              <li>
                <span className="font-semibold">Job Alerts:</span> Job seekers
                can set up job alerts to receive notifications of new job
                postings that match their criteria.
              </li>
              <li>
                <span className="font-semibold">Career Resources:</span> We may
                provide additional resources such as career advice, industry
                news, and salary information.
              </li>
              <li>
                <span className="font-semibold">Dedicated Services:</span>{" "}
                Customized recruitment and placement services with personal
                recruiter assistance tailored to meet your specific need to seek
                employment or find specialized skilled job seekers.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Fee &ndash; Job Seekers
            </h3>
            <p>
              global nationals may use the job portal for free, without paying any
              membership fee. Job Seekers may sign up for free and use the basic
              services without paying a fee. You may upgrade your membership
              account for a fee as outlined in the various subscription packages
              to benefit from an advanced level of services and functionality.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Fee &ndash; Employers
            </h3>
            <p>
              Employers may advertise their jobs on the job portal for a fee as
              outlined in the various job posting packages and recruitment.
              RatchetUp may offer additional job posting packages and
              promotions during the year.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Refund Policy
            </h3>
            <p>
              Refunds may be requested within the first seven (7) days of
              account sign-up provided that as a job-seeker you have not (i)
              applied to any jobs advertised on the portal; or (ii) you have not
              been contacted by any recruiter for any job advertised on the
              portal; or (iii) the services as described have not been delivered
              to you.
            </p>
            <p className="mt-2">
              You must request a refund in writing stating clearly your reasons
              for requesting the refund, and what services were not delivered to
              you. Please send your requests to
              WhatsApp Us. Refunds may take up to 180 days
              to be processed. Refunds may be issued at the discretion of
              RatchetUp.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              No Guarantee
            </h3>
            <p>
              Please note that while we strive to provide a high-quality
              service, we cannot guarantee that employers will find suitable
              candidates or that job seekers will find employment through our
              platform. International job-seekers that require work visas are
              further cautioned that their job search may take an extended period
              of time, may be more difficult to obtain employment in the global,
              and may not result in any employment offers. The fee you pay is
              for a subscription to use our platform and not a success fee for
              finding a job or a suitable candidate to fill your job.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Disclaimer of Warranties
            </h3>
            <p>
              The RatchetUp website and its content are provided on an "as
              is" and "as available" basis, without warranties of any kind,
              either express or implied. RatchetUp disclaims all warranties,
              including but not limited to, implied warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement. RatchetUp makes no warranty that the website
              will be error-free, uninterrupted, or secure.
            </p>
            <p className="mt-2">
              RatchetUp makes no representations or warranties regarding:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-1">
              <li>
                The accuracy or reliability of job listings or candidate
                resumes.
              </li>
              <li>
                The success of any recruitment effort or job application.
              </li>
              <li>
                The continuous, uninterrupted, or error-free operation of the
                Website.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Limitation of Liability
            </h3>
            <p>
              In no event shall RatchetUp be liable for any indirect,
              incidental, special, consequential, or exemplary damages,
              including but not limited to, damages for loss of profits, data,
              or use, arising out of or in connection with the use or inability
              to use the website or its content.
            </p>
            <p className="mt-2">
              In the event that RatchetUp is found liable for any damages
              arising out of or in connection with the use of the website, such
              damages shall not exceed the total amount paid by you for the use
              of the website during the preceding twelve months.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Indemnification
            </h3>
            <p>
              You agree to indemnify, defend, and hold harmless RatchetUp,
              its affiliates, officers, directors, employees, and agents from
              and against any and all claims, liabilities, damages, losses,
              costs, and expenses (including reasonable attorneys' fees) arising
              out of or in connection with your use of the website or violation
              of these Terms &amp; Conditions.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Termination
            </h3>
            <p>
              RatchetUp may terminate your access to the website or these
              Terms &amp; Conditions at any time, without notice, for any
              reason, including but not limited to, your violation of these
              Terms &amp; Conditions. Upon termination, your right to use the
              website will immediately cease.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">
              Governing Law
            </h3>
            <p>
              These Terms &amp; Conditions shall be governed by and construed in
              accordance with the laws of the Province of Ontario, Canada. Any
              dispute arising out of or in connection with these Terms &amp;
              Conditions shall be submitted to the exclusive jurisdiction of the
              courts of Ontario.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-orange-500 mb-2">Notices</h3>
            <p>Notices may be sent to:</p>
            <p className="mt-2">
              RatchetUp
              <br />
              Suite 502, 55 Commerce Valley
              <br />
              Markham, ON, L3T 7V9
              <br />
              WhatsApp: +254 112 549 611 | Chat with us on WhatsApp
              <br />
              Email: WhatsApp Us
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyModal;
