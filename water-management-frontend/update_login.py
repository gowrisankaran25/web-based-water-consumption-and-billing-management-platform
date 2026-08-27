import re

with open('src/pages/auth/ResidentLogin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states
content = re.sub(
    r"const \[successMessage, setSuccessMessage\] = useState\(''\);",
    "const [successMessage, setSuccessMessage] = useState('');\n  const [newPassword, setNewPassword] = useState('');\n  const [confirmPassword, setConfirmPassword] = useState('');",
    content
)

# Update handleResetPassword
new_handler = """  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.forceReset(resetEmail, newPassword);
      setSuccessMessage(res.message || 'Password successfully reset.');
      setResetSent(true);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };"""

content = re.sub(r"  const handleResetPassword = async \(e\) => \{[\s\S]*?  \};", new_handler, content)

# Update the form UI
new_form = """              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Reset Password</h3>
                    <p className="text-slate-500 text-sm">Enter your email address and your new password to reset it immediately.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-sky-400" />
                      </div>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-sky-400" />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-sky-400" />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center py-4 px-4 rounded-2xl text-sm font-bold text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-500/30 transition-all disabled:opacity-50 mt-8 shadow-lg shadow-sky-500/30 group"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForgotPassword(false); setNewPassword(''); setConfirmPassword(''); }}
                    className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-700 mt-4 transition-colors"
                  >
                    Cancel
                  </button>
                </form>"""

content = re.sub(r"              \) : \([\s\S]*?Cancel\n                  </button>\n                </form>", new_form, content)

with open('src/pages/auth/ResidentLogin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
