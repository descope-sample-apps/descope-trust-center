export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage Trust Center content
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                  <span className="text-sm font-medium text-white">C</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Certifications
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">Manage</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="/admin/certifications"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                View details
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                  <span className="text-sm font-medium text-white">D</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Documents
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">Manage</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="/admin/documents"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                View details
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500">
                  <span className="text-sm font-medium text-white">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Subprocessors
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">Manage</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="/admin/subprocessors"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                View details
              </a>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500">
                  <span className="text-sm font-medium text-white">F</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    FAQs
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">Manage</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <a
                href="/admin/faqs"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                View details
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Audit Logs
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>View recent changes to content</p>
          </div>
          <div className="mt-5">
            <a
              href="/admin/audit"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              View Audit Logs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
