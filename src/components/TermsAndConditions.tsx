'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface TermsAndConditionsProps {
  open: boolean;
  onClose: () => void;
}

export function TermsAndConditions({ open, onClose }: TermsAndConditionsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">Terms & Conditions</DialogTitle>
          <DialogDescription>
            Effective Date: May 24, 2026
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-slate-700">
            <section>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Welcome to SmartRentUG</h3>
              <p>
                By accessing or using SmartRentUG ("the Platform"), you agree to comply with and be bound by the following Terms and Conditions. Please read them carefully before using the system.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">1. Definitions</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>"Platform"</strong> refers to the SmartRentUG rental management system.</li>
                <li><strong>"User"</strong> refers to landlords, property managers, caretakers, tenants, or any person accessing the platform.</li>
                <li><strong>"Subscription"</strong> refers to the paid service plan required to access premium platform features.</li>
                <li><strong>"Property Manager"</strong> refers to the individual or company managing rental units through the platform.</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">2. Services Provided</h3>
              <p className="mb-2">SmartRentUG provides tools for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Property and unit management</li>
                <li>Tenant management</li>
                <li>Rent tracking</li>
                <li>Payment recording</li>
                <li>Receipt generation</li>
                <li>Maintenance request handling</li>
                <li>Notifications and reminders</li>
                <li>Financial reporting and analytics</li>
              </ul>
              <p className="mt-2">The platform may introduce additional features over time.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">3. Subscription Plans</h3>
              <p className="mb-2">SmartRentUG operates on a subscription-based model.</p>
              <div className="bg-slate-50 p-4 rounded-lg my-3">
                <h4 className="font-semibold mb-2">Current Plans:</h4>
                <ul className="space-y-2">
                  <li><strong>Starter:</strong> 1–5 Units - UGX 75,000/month</li>
                  <li><strong>Professional:</strong> 6–20 Units - UGX 150,000/month</li>
                  <li><strong>Premium:</strong> 21+ Units (Unlimited) - UGX 300,000/month</li>
                </ul>
              </div>
              <p>Subscription pricing may change with prior notice.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">4. Free Trial</h3>
              <p className="mb-2">New users may receive a limited free trial period determined by SmartRentUG.</p>
              <p className="mb-2">After the trial period expires:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The account may enter restricted/read-only mode until subscription payment is completed</li>
                <li>Certain platform features may become unavailable</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">5. Subscription Renewal & Access Restrictions</h3>
              <p className="mb-2">Users are responsible for maintaining active subscriptions.</p>
              <p className="mb-2">If subscription payment is not completed:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access to editing, payment recording, tenant additions, and certain management features may be restricted</li>
                <li>Account data may remain viewable for a limited period</li>
              </ul>
              <p className="mt-2">SmartRentUG reserves the right to suspend inactive or unpaid accounts after extended non-payment.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">6. Payment Terms</h3>
              <p className="mb-2">Subscription payments may be made through:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>MTN Mobile Money</li>
                <li>Airtel Money</li>
                <li>Bank transfer</li>
                <li>Other approved payment methods</li>
              </ul>
              <p className="mt-2">All payments are non-refundable unless otherwise determined by SmartRentUG.</p>
              <p>Transaction processing charges from third-party payment providers may apply.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">7. User Responsibilities</h3>
              <p className="mb-2">Users agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate information</li>
                <li>Maintain confidentiality of login credentials</li>
                <li>Use the platform lawfully</li>
                <li>Avoid fraudulent or abusive activity</li>
                <li>Ensure tenant information uploaded is lawful and accurate</li>
              </ul>
              <p className="mt-2">Users are solely responsible for the accuracy of records entered into the platform.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">8. Tenant Accounts</h3>
              <p className="mb-2">Tenant accounts may be:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Created directly by landlords/property managers; or</li>
                <li>Activated through invitation links provided by the platform</li>
              </ul>
              <p className="mt-2">Tenants may only access information related to their assigned rental units and accounts.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">9. Data Privacy & Security</h3>
              <p className="mb-2">SmartRentUG takes reasonable measures to protect user data and system security.</p>
              <p className="mb-2">However:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Users acknowledge that no internet-based service is completely secure</li>
                <li>SmartRentUG is not liable for unauthorized access caused by weak passwords, user negligence, or third-party breaches beyond reasonable control</li>
              </ul>
              <p className="mt-2">Users are encouraged to use strong passwords and maintain account security.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">10. Maintenance & Downtime</h3>
              <p className="mb-2">The platform may occasionally experience:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Scheduled maintenance</li>
                <li>Upgrades</li>
                <li>Technical interruptions</li>
              </ul>
              <p className="mt-2">SmartRentUG will make reasonable efforts to minimize downtime but does not guarantee uninterrupted service availability at all times.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">11. Prohibited Activities</h3>
              <p className="mb-2">Users shall not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Attempt unauthorized access to the platform</li>
                <li>Interfere with system operations</li>
                <li>Upload malicious software</li>
                <li>Misuse payment systems</li>
                <li>Engage in illegal activity using the platform</li>
              </ul>
              <p className="mt-2">Violation may result in immediate suspension or termination.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">12. Intellectual Property</h3>
              <p>
                All platform content, software, branding, logos, and system features remain the property of SmartRentUG unless otherwise stated. Users may not copy, distribute, or reproduce the platform without written permission.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">13. Limitation of Liability</h3>
              <p className="mb-2">SmartRentUG is not responsible for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tenant-landlord disputes</li>
                <li>Missed rent payments</li>
                <li>Inaccurate user-entered data</li>
                <li>Financial losses caused by user negligence</li>
                <li>Third-party service interruptions</li>
                <li>Indirect or consequential damages arising from platform use</li>
              </ul>
              <p className="mt-2">The platform serves as a management tool only.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">14. Account Termination</h3>
              <p className="mb-2">SmartRentUG reserves the right to suspend or terminate accounts that:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Violate these Terms</li>
                <li>Engage in fraudulent activity</li>
                <li>Abuse the platform</li>
                <li>Fail to maintain subscription obligations</li>
              </ul>
              <p className="mt-2">Users may also request account closure at any time.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">15. Changes to Terms</h3>
              <p className="mb-2">SmartRentUG reserves the right to update these Terms and Conditions at any time.</p>
              <p className="mb-2">Users will be notified of significant changes through the platform or email notifications.</p>
              <p>Continued use of the platform after updates constitutes acceptance of revised terms.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">16. Governing Law</h3>
              <p className="mb-2">These Terms shall be governed in accordance with the laws of Uganda.</p>
              <p>Any disputes arising from platform use shall be handled within the appropriate courts of Uganda.</p>
            </section>

            <section>
              <h3 className="font-bold text-base text-slate-900 mb-2">17. Contact Information</h3>
              <p className="mb-2">For support or inquiries:</p>
              <ul className="list-none space-y-1">
                <li><strong>Email:</strong> support@smartrentug.com</li>
                <li><strong>Phone:</strong> +256 XXX XXX XXX</li>
                <li><strong>Website:</strong> www.smartrentug.com</li>
              </ul>
            </section>
          </div>
        </ScrollArea>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} className="bg-emerald-500 hover:bg-emerald-600">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
