import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map, delay }  from 'rxjs/operators';
import IUser from '../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>
  // The $ sign symbol is a special naming convention for identifying properties as observables.
  public isAuthenticated$: Observable<boolean>
  public isAuthenticatedWithDelay$: Observable<boolean>
  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router
  ) {
      this.usersCollection = db.collection('users')
      this.isAuthenticated$ = auth.user.pipe(
        map(user => !!user)
      )
      this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
        delay(1000)
      )
    }

  public async createUser(userData: IUser) {
      if(!userData.password) {
        throw new Error("Password not provided !")
      }
      // The Createuser function will send a request to Firebase with the user's credentials.
      const userCred = await this.auth.createUserWithEmailAndPassword(
        userData.email,
        userData.password
      )

      if(!userCred.user) {
        // We are checking if the user property is not null, if it is, we will throw an error
        throw new Error("User can't be found !" )
      }

      await this.usersCollection.doc(userCred.user?.uid).set({
        name: userData.name,
        email:  userData.email,
        age: userData.age,
        phoneNumber: userData.phoneNumber
      })

      await userCred.user.updateProfile({
          displayName: userData.name
      })
    }

    public async logout($event?: Event) {
      if ($event) {
        $event.preventDefault()
      }

      await this.auth.signOut()

      await this.router.navigateByUrl("/")
    }
}
