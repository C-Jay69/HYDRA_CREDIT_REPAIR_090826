'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore } from '@/store/app-store';
import { Shield, User, MapPin, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming'
];

const CA_PROVINCES = [
  'Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador',
  'Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'
];

export function SettingsPage() {
  const { userId, userName, userState, userCountry, setUserId, setUserInfo } = useAppStore();
  const [name, setName] = useState(userName || '');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(userState || '');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState<string>(userCountry || 'US');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('creditshield_user');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setCity(data.city || '');
        setState(data.state || '');
        setZipCode(data.zipCode || '');
        setCountry(data.country || 'US');
        setUserId(data.id || '');
        setUserInfo(data.name || '', data.state || '', data.country || 'US');
      } catch { /* ignore */ }
    }
  }, []);

  const handleSave = async () => {
    if (!email) {
      toast.error('Email is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, phone, address, city, state, zipCode, country }),
      });
      const data = await res.json();
      if (data.id) {
        const userData = { id: data.id, name, email, phone, address, city, state, zipCode, country };
        localStorage.setItem('creditshield_user', JSON.stringify(userData));
        setUserId(data.id);
        setUserInfo(name, state, country as 'US' | 'CA');
        toast.success('Settings saved successfully');
      } else {
        toast.error('Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your profile and jurisdiction settings</p>
      </div>

      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Your jurisdiction determines which laws apply to your disputes. Please ensure your state/province and country are accurate.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Information</CardTitle>
          <CardDescription>This information will be used to pre-fill dispute letters and legal documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" placeholder="(555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input id="address" placeholder="123 Main St" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" placeholder="New York" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP / Postal Code</Label>
              <Input id="zip" placeholder="10001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Jurisdiction</CardTitle>
          <CardDescription>Your jurisdiction determines which consumer protection laws apply (FCRA/FDCPA for US, PIPEDA for Canada).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{country === 'US' ? 'State' : 'Province'}</Label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger><SelectValue placeholder={`Select ${country === 'US' ? 'state' : 'province'}`} /></SelectTrigger>
                <SelectContent>
                  {(country === 'US' ? US_STATES : CA_PROVINCES).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {state && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                {country === 'US'
                  ? `Applying FCRA, FDCPA, and ${state} state law to your disputes.`
                  : `Applying PIPEDA and ${state} provincial law to your disputes.`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
